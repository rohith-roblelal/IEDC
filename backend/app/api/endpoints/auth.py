from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Any
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta
import secrets
import uuid

from app.database.session import get_db
from app.auth.security import verify_password, create_access_token, needs_password_rehash, get_password_hash, generate_reset_token
from app.repositories.user import UserRepository
from app.schemas.schemas import Token, ForgotPasswordRequest, ResetPasswordRequest
from app.core.config import settings
from app.core.rate_limit import limiter
from app.api.dependencies import oauth2_scheme, get_current_user
from app.models.models import TokenBlocklist, PasswordResetToken
from app.services.audit import log_audit_event
from app.services.email import email_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

@router.post("/login")
@limiter.limit("5/minute")
async def login_access_token(
    request: Request, response: Response, db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(email=form_data.username)
    client_ip = request.client.host if request.client else None

    if not user:
        # Avoid user enumeration by taking roughly the same time as a real verification
        # and returning a generic error message
        get_password_hash("dummy_password_to_prevent_timing_attacks")
        await log_audit_event(db, "LOGIN_FAILED", ip_address=client_ip, metadata_json={"reason": "User not found", "email": form_data.username})
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Check lockout
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        await log_audit_event(db, "LOGIN_LOCKED", user_id=user.id, ip_address=client_ip, metadata_json={"email": form_data.username})
        raise HTTPException(status_code=400, detail="Account locked due to too many failed attempts. Try again later.")

    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            await log_audit_event(db, "ACCOUNT_LOCKED", user_id=user.id, ip_address=client_ip)
        
        await db.commit()
        await log_audit_event(db, "LOGIN_FAILED", user_id=user.id, ip_address=client_ip, metadata_json={"reason": "Incorrect password"})
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Login successful, reset attempts and lockout
    user.failed_login_attempts = 0
    user.locked_until = None

    # Transparently upgrade password hash if needed (e.g. bcrypt -> argon2)
    if needs_password_rehash(user.hashed_password):
        user.hashed_password = get_password_hash(form_data.password)
        logger.info(f"Upgraded password hash for user {user.email}")
    
    await db.commit()

    await log_audit_event(db, "LOGIN_SUCCESS", user_id=user.id, ip_address=client_ip)
    
    access_token = create_access_token(
        subject=user.email, role=user.role.value
    )
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return {
        "message": "Login successful",
        "user": {
            "email": user.email,
            "role": user.role.value
        }
    }


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """
    Get the currently authenticated user based on the HttpOnly cookie.
    """
    return {
        "authenticated": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role.value
        }
    }
@router.post("/logout")
async def logout(
    request: Request,
    response: Response, 
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout the user by adding the token to the blocklist and clearing the cookie.
    """
    client_ip = request.client.host if request.client else None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        jti = payload.get("jti")
        email = payload.get("sub", "unknown")
        
        user_repo = UserRepository(db)
        user = await user_repo.get_by_email(email=email)
        user_id = user.id if user else None

        if jti:
            blocked_token = TokenBlocklist(jti=jti)
            db.add(blocked_token)
            await log_audit_event(db, "LOGOUT", user_id=user_id, ip_address=client_ip)
            await db.commit()
    except JWTError:
        await log_audit_event(db, "LOGOUT_FAILED", ip_address=client_ip, metadata_json={"reason": "Invalid token"})
        
    response.delete_cookie(
        key="access_token",
        secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False,
        samesite="lax",
    )
    return {"status": "success", "message": "Logged out successfully"}

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a password reset token and send it via email.
    """
    client_ip = request.client.host if request.client else None
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(email=body.email)
    
    if not user:
        # Pretend we sent an email to prevent user enumeration
        get_password_hash("dummy_password_to_prevent_timing_attacks")
        return {"status": "success", "message": "If that email is registered, a password reset link has been sent."}
    
    # Invalidate any previous unused reset tokens for this user
    invalidate_stmt = update(PasswordResetToken).where(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None)
    ).values(used_at=datetime.now(timezone.utc))
    await db.execute(invalidate_stmt)

    reset_secret = secrets.token_urlsafe(32)
    token_hash = get_password_hash(reset_secret)
    
    # Store token hash in db, valid for 15 minutes
    db_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        hash_algorithm="argon2",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15)
    )
    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)
    
    await log_audit_event(db, "PASSWORD_RESET_REQUESTED", user_id=user.id, ip_address=client_ip)
    
    # Send email
    full_token = f"{db_token.id}.{reset_secret}"
    await email_service.send_password_reset_email(user.email, full_token)
    
    return {"status": "success", "message": "If that email is registered, a password reset link has been sent."}

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using a valid reset token.
    """
    client_ip = request.client.host if request.client else None
    
    # We need to find a token that matches the hash.
    # Since we can't easily lookup by plain text token (as it's hashed in DB),
    # the frontend usually sends the user ID along with the token, OR we just 
    # check all active tokens. For security and simplicity, we can fetch all valid
    # unused tokens and verify the hash. However, if there are many, it's slow.
    # A better pattern is returning `token_id:token_secret` in the email link,
    # or just storing the token in DB as an HMAC rather than a slow password hash.
    # BUT, since we used `get_password_hash` (argon2), checking all tokens is very slow.
    
    # Alternative: The token sent in email could be `user_id:secret`.
    # Let's adjust: if the token is just a random string, finding it requires checking all hashes.
    # Let's fix this by requiring the frontend to pass `email` or embedding `user_id` in the token.
    # Actually, we can embed the user_id in the token: `user_id:random_string`.
    
    # Let's decode the token to get the user ID
    try:
        token_id_str, token_secret = body.token.split(".", 1)
        token_id_uuid = uuid.UUID(token_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token format")
        
    # O(1) lookup for the exact token
    stmt = select(PasswordResetToken).where(
        PasswordResetToken.id == token_id_uuid,
        PasswordResetToken.used_at.is_(None),
        PasswordResetToken.expires_at > datetime.now(timezone.utc)
    )
    result = await db.execute(stmt)
    valid_token_obj = result.scalar_one_or_none()
    
    if not valid_token_obj:
        await log_audit_event(db, "PASSWORD_RESET_FAILED", ip_address=client_ip, metadata_json={"reason": "Invalid, expired, or already used token"})
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
            
    # Verify the hash in constant time
    if not verify_password(token_secret, valid_token_obj.token_hash):
        await log_audit_event(db, "PASSWORD_RESET_FAILED", ip_address=client_ip, metadata_json={"reason": "Invalid token secret"})
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    # Valid token found, update password
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(valid_token_obj.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(body.new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    
    # Invalidate token
    valid_token_obj.used_at = datetime.now(timezone.utc)
    
    await db.commit()
    await log_audit_event(db, "PASSWORD_RESET_COMPLETED", user_id=user.id, ip_address=client_ip)
    
    return {"status": "success", "message": "Password has been successfully reset"}

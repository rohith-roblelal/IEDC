from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Any
import jwt
from datetime import datetime, timezone, timedelta
import secrets
import uuid

from app.database.session import get_db
from app.auth.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    needs_password_rehash,
    get_password_hash,
    generate_reset_token,
    hash_token_for_storage,
    build_refresh_cookie_name,
)
from app.repositories.user import UserRepository
from app.schemas.schemas import Token, ForgotPasswordRequest, ResetPasswordRequest
from app.core.config import settings
from app.core.rate_limit import limiter
from app.api.dependencies import oauth2_scheme, get_current_user
from app.models.models import TokenBlocklist, PasswordResetToken, UserSession
from app.api.middleware.turnstile import verify_bot_token
from app.services.audit import log_audit_event
from app.services.email import email_service
import structlog
import logging

logger = logging.getLogger(__name__)
auth_logger = structlog.get_logger("auth")
router = APIRouter()

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


def _set_session_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False,
        samesite="lax",
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key=build_refresh_cookie_name(),
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False,
        samesite="lax",
        path="/",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


@router.post("/login")
@limiter.limit("5/minute")
async def login_access_token(
    request: Request, response: Response, 
    db: AsyncSession = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends(),
    _bot: bool = Depends(verify_bot_token)
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
        auth_logger.warning("login_failure", reason="User not found")
        await log_audit_event(db, "LOGIN_FAILED", ip_address=client_ip, metadata_json={"reason": "User not found", "email": form_data.username})
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Check lockout
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        auth_logger.warning("login_failure", reason="Account locked", user_id=str(user.id))
        await log_audit_event(db, "LOGIN_LOCKED", user_id=user.id, ip_address=client_ip, metadata_json={"email": form_data.username})
        raise HTTPException(status_code=400, detail="Account locked due to too many failed attempts. Try again later.")

    # Verify password
    if not user or not verify_password(plain_password=form_data.password, hashed_password=str(user.hashed_password)):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            auth_logger.warning("account_locked", user_id=str(user.id))
            await log_audit_event(db, "ACCOUNT_LOCKED", user_id=user.id, ip_address=client_ip)
        
        await db.commit()
        auth_logger.warning("login_failure", reason="Incorrect password", user_id=str(user.id))
        await log_audit_event(db, "LOGIN_FAILED", user_id=user.id, ip_address=client_ip, metadata_json={"reason": "Incorrect password"})
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Login successful, reset attempts and lockout
    user.failed_login_attempts = 0
    user.locked_until = None

    # Transparently upgrade password hash if needed (e.g. bcrypt -> argon2)
    if needs_password_rehash(str(user.hashed_password)):
        user.hashed_password = get_password_hash(form_data.password)
        logger.info(f"Upgraded password hash for user {user.email}")
    
    await db.commit()

    auth_logger.info("login_success", user_id=str(user.id))
    await log_audit_event(db, "LOGIN_SUCCESS", user_id=user.id, ip_address=client_ip)

    session_id = uuid.uuid4()
    token_family = str(uuid.uuid4())
    refresh_token = create_refresh_token(str(session_id), token_family)
    session = UserSession(
        id=session_id,
        user_id=user.id,
        token_family=token_family,
        refresh_token_hash=hash_token_for_storage(refresh_token),
        refresh_token_jti=jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"verify_exp": False, "verify_aud": False, "verify_iss": False}).get("jti", str(uuid.uuid4())),
        user_agent=request.headers.get("user-agent", "Unknown"),
        ip_address=client_ip,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    await db.commit()

    access_token = create_access_token(subject=user.email, role=user.role.value, session_id=str(session_id))
    _set_session_cookies(response, access_token, refresh_token)

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
    Logout the user by revoking the active session and clearing the auth cookies.
    """
    client_ip = request.client.host if request.client else None
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
            options={"require": ["exp", "sub", "role", "jti", "iat", "nbf"]},
        )
        jti = payload.get("jti")
        email = payload.get("sub", "unknown")
        session_id = payload.get("sid")

        user_repo = UserRepository(db)
        user = await user_repo.get_by_email(email=email)
        user_id = user.id if user else None

        if jti:
            blocked_token = TokenBlocklist(jti=jti)
            db.add(blocked_token)

        if session_id:
            try:
                session_uuid = uuid.UUID(str(session_id))
            except (ValueError, TypeError):
                session_uuid = None
            if session_uuid is not None:
                session_result = await db.execute(select(UserSession).where(UserSession.id == session_uuid, UserSession.user_id == user_id))
                session = session_result.scalars().first()
                if session is not None:
                    session.revoked_at = datetime.now(timezone.utc)
                    session.revoked_reason = "logout"
                    session.is_active = False

        auth_logger.info("logout", user_id=str(user_id) if user_id else "unknown")
        await log_audit_event(db, "LOGOUT", user_id=user_id, ip_address=client_ip)
        await db.commit()
    except jwt.InvalidTokenError:
        auth_logger.warning("logout_failed", reason="Invalid token")
        await log_audit_event(db, "LOGOUT_FAILED", ip_address=client_ip, metadata_json={"reason": "Invalid token"})

    response.delete_cookie(key="access_token", secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False, samesite="lax", path="/")
    response.delete_cookie(key=build_refresh_cookie_name(), secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False, samesite="lax", path="/")
    return {"status": "success", "message": "Logged out successfully"}


@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh_access_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get(build_refresh_cookie_name())
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
            options={"require": ["exp", "sub", "sid", "fam", "jti", "iat", "nbf"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

    session_id = payload.get("sid")
    family_id = payload.get("fam")
    jti = payload.get("jti")
    if not session_id or not family_id or not jti:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    try:
        session_uuid = uuid.UUID(str(session_id))
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid refresh session")

    session_result = await db.execute(
        select(UserSession).where(
            UserSession.id == session_uuid,
            UserSession.token_family == family_id,
            UserSession.is_active.is_(True),
            UserSession.revoked_at.is_(None),
            UserSession.expires_at > datetime.now(timezone.utc),
        )
    )
    session = session_result.scalars().first()
    if session is None:
        raise HTTPException(status_code=401, detail="Refresh session is no longer valid")

    if session.refresh_token_jti != jti:
        session.revoked_at = datetime.now(timezone.utc)
        session.revoked_reason = "refresh_reuse"
        session.is_active = False
        await db.commit()
        await log_audit_event(db, "REFRESH_TOKEN_REUSE", user_id=session.user_id, ip_address=request.client.host if request.client else None)
        raise HTTPException(status_code=401, detail="Refresh token replay detected")

    user_result = await db.execute(select(User).where(User.id == session.user_id, User.deleted_at.is_(None)))
    user = user_result.scalars().first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    new_refresh_token = create_refresh_token(str(session.id), session.token_family)
    session.refresh_token_hash = hash_token_for_storage(new_refresh_token)
    session.refresh_token_jti = jwt.decode(new_refresh_token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"verify_exp": False, "verify_aud": False, "verify_iss": False}).get("jti", str(uuid.uuid4()))
    session.last_used_at = datetime.now(timezone.utc)
    session.expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await db.commit()

    access_token = create_access_token(subject=user.email, role=user.role.value, session_id=str(session.id))
    _set_session_cookies(response, access_token, new_refresh_token)
    await log_audit_event(db, "REFRESH_SUCCESS", user_id=user.id, ip_address=request.client.host if request.client else None)
    return {"status": "success", "message": "Session refreshed"}


@router.post("/change-password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    body: dict = None,
):
    if body is None:
        raise HTTPException(status_code=422, detail="Request body required")
    current_password = body.get("current_password")
    new_password = body.get("new_password")
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new password are required")
    if not verify_password(current_password, str(current_user.hashed_password)):
        await log_audit_event(db, "PASSWORD_CHANGE_FAILED", user_id=current_user.id, ip_address=request.client.host if request.client else None)
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(new_password)
    current_user.failed_login_attempts = 0
    current_user.locked_until = None
    session_result = await db.execute(select(UserSession).where(UserSession.user_id == current_user.id, UserSession.is_active.is_(True), UserSession.revoked_at.is_(None)))
    for session in session_result.scalars().all():
        session.revoked_at = datetime.now(timezone.utc)
        session.revoked_reason = "password_change"
        session.is_active = False
    await db.commit()
    response.delete_cookie(key="access_token", secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False, samesite="lax", path="/")
    response.delete_cookie(key=build_refresh_cookie_name(), secure=settings.ENVIRONMENT == "production" if hasattr(settings, "ENVIRONMENT") else False, samesite="lax", path="/")
    await log_audit_event(db, "PASSWORD_CHANGE_COMPLETED", user_id=current_user.id, ip_address=request.client.host if request.client else None)
    return {"status": "success", "message": "Password updated successfully"}

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
    _bot: bool = Depends(verify_bot_token)
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

    reset_token_raw = secrets.token_urlsafe(32)
    token_hash = get_password_hash(reset_token_raw)
    
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
    await email_service.send_password_reset_email(to_email=str(user.email), reset_token=reset_token_raw)
    
    return {"status": "success", "message": "If that email is registered, a password reset link has been sent."}

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    _bot: bool = Depends(verify_bot_token)
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
    updated_user = await user_repo.get_by_id(user_id=valid_token_obj.user_id) # type: ignore
    if not updated_user:
        raise HTTPException(status_code=400, detail="User not found")
        
    updated_user.hashed_password = get_password_hash(body.new_password)
    updated_user.failed_login_attempts = 0
    updated_user.locked_until = None
    
    # Invalidate token
    valid_token_obj.used_at = datetime.now(timezone.utc)
    
    await db.commit()
    await log_audit_event(db, "PASSWORD_RESET_COMPLETED", user_id=user.id, ip_address=client_ip)
    
    return {"status": "success", "message": "Password has been successfully reset"}

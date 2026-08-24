import httpx
from fastapi import Request, HTTPException
from app.core.config import settings

async def verify_bot_token(request: Request):
    """
    Dependency to verify Cloudflare Turnstile token.
    Reads 'cf-turnstile-response' from headers or JSON body.
    """
    # Skip if not configured
    if not hasattr(settings, 'TURNSTILE_SECRET_KEY') or not settings.TURNSTILE_SECRET_KEY:
        return True

    # Allow bypassing in dev
    if getattr(settings, 'ENVIRONMENT', 'development') == "development":
        return True

    token = request.headers.get("cf-turnstile-response")
    
    # If not in header, try body
    if not token:
        try:
            body = await request.json()
            token = body.get("cf-turnstile-response") or body.get("turnstile_token")
        except Exception:
            pass

    if not token:
        raise HTTPException(status_code=403, detail="Bot protection challenge missing")

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={
                    "secret": settings.TURNSTILE_SECRET_KEY,
                    "response": token,
                    "remoteip": request.client.host if request.client else ""
                },
                timeout=5.0
            )
            result = resp.json()
            if not result.get("success"):
                raise HTTPException(status_code=403, detail="Bot protection challenge failed")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Unable to verify bot protection at this time")
    
    return True

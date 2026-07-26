import logging
import resend
from app.core.config import settings
from typing import Protocol

logger = logging.getLogger(__name__)

# Initialize Resend
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY

class EmailProvider(Protocol):
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        ...

class ResendEmailProvider(EmailProvider):
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        if not settings.RESEND_API_KEY or settings.RESEND_API_KEY.startswith("re_dummy"):
            logger.warning("RESEND_API_KEY is not configured or is a dummy key. Skipping email send.")
            return False
            
        frontend_url = settings.FRONTEND_URLS.split(",")[0]
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        html = f"""
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #22D46B;">Password Reset - IEDC SNMIMT</h2>
            <p>You have requested to reset your password. Please click the button below to set a new password. This link will expire in 15 minutes.</p>
            <a href="{reset_link}" style="display: inline-block; padding: 10px 20px; background-color: #22D46B; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        </div>
        """
        
        try:
            params = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": "Password Reset Request",
                "html": html
            }
            resend.Emails.send(params)
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email via Resend: {e}")
            return False

class ConsoleEmailProvider(EmailProvider):
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        frontend_url = settings.FRONTEND_URLS.split(",")[0]
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        logger.info("=========================================")
        logger.info(f"EMAIL TO: {to_email}")
        logger.info(f"SUBJECT: Password Reset Request")
        logger.info(f"BODY: Click the link to reset your password:\n{reset_link}")
        logger.info("=========================================")
        return True

class EmailService:
    def __init__(self, provider: EmailProvider):
        self._provider = provider
        
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        return await self._provider.send_password_reset_email(to_email, reset_token)

# Provide a default instance depending on environment.
# Using ConsoleProvider as default if no API key is provided, otherwise use Resend.
if settings.RESEND_API_KEY and not settings.RESEND_API_KEY.startswith("re_dummy"):
    email_service = EmailService(provider=ResendEmailProvider())
else:
    email_service = EmailService(provider=ConsoleEmailProvider())

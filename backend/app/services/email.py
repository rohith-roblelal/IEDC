import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings
from typing import Protocol

logger = logging.getLogger(__name__)

class EmailProvider(Protocol):
    async def send_reply_email(self, to_email: str, original_message: str, reply_text: str) -> bool:
        ...
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        ...

class FastMailProvider(EmailProvider):
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USER or "dummy_user",
            MAIL_PASSWORD=settings.SMTP_PASSWORD or "dummy_pass",
            MAIL_FROM=settings.SMTP_USER or "noreply@iedc.com",
            MAIL_PORT=settings.SMTP_PORT or 587,
            MAIL_SERVER=settings.SMTP_HOST or "smtp.dummy.com",
            MAIL_FROM_NAME="IEDC SNMIMT",
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        self.fm = FastMail(self.conf)

    async def send_reply_email(self, to_email: str, original_message: str, reply_text: str) -> bool:
        html = f"""
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #22D46B;">Response to your Enquiry - IEDC SNMIMT</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin-bottom: 20px;">
                <p style="margin: 0; color: #666;"><strong>Your Message:</strong></p>
                <p style="margin-top: 5px; font-style: italic;">{original_message}</p>
            </div>
            
            <p>{reply_text.replace(chr(10), '<br>')}</p>
            
            <br>
            <p>Best regards,</p>
            <p><strong>IEDC SNMIMT Admin Team</strong></p>
        </div>
        """
        message = MessageSchema(
            subject="Re: Your Enquiry to IEDC SNMIMT",
            recipients=[to_email],
            body=html,
            subtype=MessageType.html
        )
        try:
            await self.fm.send_message(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
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
        message = MessageSchema(
            subject="Password Reset Request",
            recipients=[to_email],
            body=html,
            subtype=MessageType.html
        )
        try:
            await self.fm.send_message(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            return False

class ConsoleEmailProvider(EmailProvider):
    async def send_reply_email(self, to_email: str, original_message: str, reply_text: str) -> bool:
        logger.info(f"CONSOLE EMAIL: Reply to {to_email}. Original: {original_message}. Reply: {reply_text}")
        return True
        
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
        
    async def send_reply_email(self, to_email: str, original_message: str, reply_text: str) -> bool:
        return await self._provider.send_reply_email(to_email, original_message, reply_text)
        
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        return await self._provider.send_password_reset_email(to_email, reset_token)

# Provide a default instance. Change to FastMailProvider() when SMTP is configured.
email_service = EmailService(provider=ConsoleEmailProvider())

# Backward compatibility for existing imports
async def send_reply_email(to_email: EmailStr, original_message: str, reply_text: str):
    await email_service.send_reply_email(to_email, original_message, reply_text)

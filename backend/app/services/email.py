import logging
from app.core.config import settings
from typing import Protocol

logger = logging.getLogger(__name__)

class EmailProvider(Protocol):
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        ...

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

# Console-only provider — no external email service required
email_service = EmailService(provider=ConsoleEmailProvider())

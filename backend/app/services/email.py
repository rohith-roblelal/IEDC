import logging
from typing import Protocol

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailProvider(Protocol):
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        ...


class ConsoleEmailProvider(EmailProvider):
    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        frontend_url = settings.FRONTEND_URLS.split(",")[0].strip()
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        logger.warning("email_provider_fallback", extra={"to_email": to_email, "reset_link": reset_link})
        logger.info("=========================================")
        logger.info(f"EMAIL TO: {to_email}")
        logger.info(f"SUBJECT: Password Reset Request")
        logger.info(f"BODY: Click the link to reset your password:\n{reset_link}")
        logger.info("=========================================")
        return True


class ResendEmailProvider(EmailProvider):
    def __init__(self):
        if not settings.RESEND_API_KEY or not settings.RESEND_API_KEY.strip():
            raise ValueError("RESEND_API_KEY is required when using Resend email delivery.")

        try:
            from resend import Resend
        except ImportError as exc:
            raise RuntimeError("resend package is not installed") from exc

        self._client = Resend(settings.RESEND_API_KEY)

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        frontend_url = settings.FRONTEND_URLS.split(",")[0].strip()
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        payload = {
            "from": settings.EMAIL_FROM,
            "to": [to_email],
            "subject": "Password Reset Request",
            "html": (
                "<p>You requested a password reset for your IEDC SNMIMT account.</p>"
                f"<p><a href=\"{reset_link}\">Reset your password</a></p>"
                "<p>If you did not request this, you can safely ignore this email.</p>"
            ),
        }

        try:
            response = self._client.emails.send(payload)
            return bool(response and getattr(response, "id", None))
        except Exception as exc:  # pragma: no cover
            logger.exception("resend_email_send_failed", extra={"to_email": to_email})
            raise RuntimeError("Failed to send password reset email") from exc


class EmailService:
    def __init__(self, provider: EmailProvider):
        self._provider = provider

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        return await self._provider.send_password_reset_email(to_email, reset_token)


def _build_email_provider() -> EmailProvider:
    if settings.ENVIRONMENT == "production":
        return ResendEmailProvider()
    if settings.RESEND_API_KEY and settings.RESEND_API_KEY.strip():
        return ResendEmailProvider()
    return ConsoleEmailProvider()


email_service = EmailService(provider=_build_email_provider())

import asyncio
from app.services.email import email_service
from app.core.config import settings

async def main():
    print("RESEND API KEY configured:", bool(settings.RESEND_API_KEY))
    try:
        await email_service.send_password_reset_email(
            to_email="test@example.com",
            reset_token="test-token-123"
        )
        print("Success")
    except Exception as e:
        print("Error:", str(e))

asyncio.run(main())

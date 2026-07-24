import asyncio
from app.services.email import send_reply_email
from app.core.config import settings

async def main():
    print("SMTP USER:", settings.SMTP_USER)
    try:
        await send_reply_email(
            to_email="test@example.com",
            original_message="haiii",
            reply_text="helo"
        )
        print("Success")
    except Exception as e:
        print("Error:", str(e))

asyncio.run(main())

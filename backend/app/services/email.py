from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SMTP_USER,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_FROM_NAME="IEDC SNMIMT",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_reply_email(to_email: EmailStr, original_message: str, reply_text: str):
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

    fm = FastMail(conf)
    await fm.send_message(message)

import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

def send_magic_link(email: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL")
    link = f"{frontend_url}/auth/verify?token={token}"

    msg = MIMEText(f"Click to login:\n\n{link}")
    msg["Subject"] = "Your GatePass Login Link"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = email

    with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
        server.starttls()
        server.login(
            os.getenv("MAIL_USERNAME"),
            os.getenv("MAIL_PASSWORD")
        )
        server.send_message(msg)

def send_otp(email: str, code: str):
    msg = MIMEText(f"Your GatePass verification code is;\n\n{code}\n\nIt expiresin 10 minutes.")
    msg["Subject"] = "Your GatePass OTP Code"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = email

    with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
        server.starttls()
        server.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
        server.send_message(msg)
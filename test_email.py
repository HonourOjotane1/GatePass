import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Fetch credentials from .env
SMTP_HOST = os.getenv("MAIL_SERVER")
SMTP_PORT = int(os.getenv("MAIL_PORT"))
SMTP_USERNAME = os.getenv("MAIL_USERNAME")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD")
EMAIL_FROM = os.getenv("MAIL_FROM")

# Change this to your email (or any test recipient)
TEST_RECIPIENT = "ojotanehonour@gmail.com"

def send_test_email():
    try:
        # Create a plain text email message
        msg = MIMEText("✅ This is a test email from your FastAPI project.")
        msg["Subject"] = "SMTP Test Email"
        msg["From"] = EMAIL_FROM
        msg["To"] = TEST_RECIPIENT

        # Connect to the SMTP server
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()  # Start TLS encryption
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            print("✅ Email sent successfully!")

    except Exception as e:
        print("❌ Error sending email:", e)

if __name__ == "__main__":
    send_test_email()

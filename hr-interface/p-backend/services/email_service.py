import smtplib
from email.mime.text import MIMEText

def send_otp_email(to_email, otp):
    sender_email = "bhanux11111@gmail.com"
    sender_pass = "muqz zgth zojh wuek"

    msg = MIMEText(f"Your OTP is: {otp}")
    msg["Subject"] = "AI Resume Screener - OTP Verification"
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_pass)
            server.send_message(msg)
        print(f"✅ OTP email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")

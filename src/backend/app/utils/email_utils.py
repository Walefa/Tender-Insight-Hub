import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.example.com"  # Replace with your SMTP server
SMTP_PORT = 587
SMTP_USERNAME = "your@email.com"  # Replace with your email
SMTP_PASSWORD = "yourpassword"    # Replace with your password
MAIL_FROM = "your@email.com"      # Replace with your email

async def send_invitation_email(email: str, token: str):
    link = f"https://your-backend.com/accept-invite?token={token}"
    subject = "You're invited to join a team!"
    body = f"""
    <p>You have been invited to join a team on Tender Insight Hub.</p>
    <p>Click <a href='{link}'>here</a> to accept your invitation.</p>
    <p>If you did not expect this email, you can ignore it.</p>
    """
    msg = MIMEMultipart()
    msg['From'] = MAIL_FROM
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(MAIL_FROM, email, msg.as_string())
    except Exception as e:
        print(f"Failed to send invitation email: {e}")

import os
from pathlib import Path
from urllib.parse import quote

import resend
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent / ".env")


def send_password_reset_email(to_email: str, token: str) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY no esta configurada.")

    resend.api_key = api_key

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    email_from = os.getenv("EMAIL_FROM", "TrackFlow <onboarding@resend.dev>")
    reset_url = f"{frontend_url}/reset-password?token={quote(token, safe='')}"

    try:
        resend.Emails.send(
            {
                "from": email_from,
                "to": [to_email],
                "subject": "Restablecer contrasena en TrackFlow",
                "html": f"""
                    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
                      <h2>Restablecer contrasena</h2>
                      <p>Recibimos una solicitud para cambiar tu contrasena.</p>
                      <p>Este enlace vence en 30 minutos y solo puede usarse una vez.</p>
                      <p>
                        <a href="{reset_url}" style="display: inline-block; padding: 12px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px;">
                          Restablecer contrasena
                        </a>
                      </p>
                      <p>Si no solicitaste este cambio, ignora este email.</p>
                    </div>
                """,
            }
        )
    except Exception as error:
        raise RuntimeError("No se pudo enviar el email para restablecer la contrasena.") from error

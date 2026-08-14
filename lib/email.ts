import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function throneTemplate(title: string, bodyHtml: string, buttonHtml?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #0A0A0F; color: #F5F0E6; font-family: Inter, sans-serif; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
    .logo { color: #D4AF37; font-family: Cinzel, serif; font-size: 22px; text-align: center; margin-bottom: 32px; letter-spacing: 0.1em; }
    h2 { font-family: Cinzel, serif; font-size: 18px; font-weight: 500; margin-bottom: 16px; color: #F5F0E6; }
    p { line-height: 1.7; font-size: 14px; color: #B0B0B0; margin-bottom: 16px; }
    .btn { display: inline-block; background: #D4AF37; color: #0A0A0F; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; margin: 8px 0 24px; }
    .btn-alt { background: #B87333; color: #F5F0E6; }
    .code { background: #14141E; border: 1px solid #2A2A3E; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #8A8A9A; word-break: break-all; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #2A2A3E; text-align: center; font-size: 11px; color: #8A8A9A; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">THRONE NOTES</div>
    <h2>${title}</h2>
    ${bodyHtml}
    ${buttonHtml ? `<div>${buttonHtml}</div>` : ""}
    <div class="footer">Throne Notes — Kingdom Operating System<br/>This email was sent from your command center.</div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${baseUrl()}/api/auth/verify-email?token=${token}`;
  
  const html = throneTemplate(
    "Verify Your Kingdom Account",
    `<p>You are one step away from entering the Throne Room. Click the seal below to verify your email and activate your account.</p>`,
    `<a href="${url}" class="btn">VERIFY EMAIL</a><p style="font-size:12px;color:#8A8A9A;">Or paste this link:<br/><span class="code">${url}</span></p>`
  );

  if (!resend) {
    console.log(`[DEV EMAIL] Verify ${email}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: "Throne Notes <onboarding@resend.dev>",
    to: email,
    subject: "Verify your Throne Notes account",
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${baseUrl()}/reset-password?token=${token}`;

  const html = throneTemplate(
    "Reset Your Password",
    `<p>A request was made to reset the password for your Throne Notes account. If this was you, click below. If not, ignore this dispatch.</p><p style="font-size:12px;color:#8A8A9A;">This link expires in 1 hour.</p>`,
    `<a href="${url}" class="btn btn-alt">RESET PASSWORD</a>`
  );

  if (!resend) {
    console.log(`[DEV EMAIL] Reset ${email}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: "Throne Notes <onboarding@resend.dev>",
    to: email,
    subject: "Reset your Throne Notes password",
    html,
  });
}
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || "Throne Notes <onboarding@thronenotes.com>";
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function throneEmail(title: string, headline: string, body: string, cta?: { text: string; url: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#07070A;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#F5F0E6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#0F0F1A;border:1px solid #1E1E2E;border-radius:16px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0A0A0F 0%,#14141E 100%);padding:40px 40px 32px;text-align:center;border-bottom:1px solid #1E1E2E;">
              <div style="font-family:'Cinzel',serif;font-size:28px;font-weight:700;color:#D4AF37;letter-spacing:0.15em;margin-bottom:8px;">THRONE NOTES</div>
              <div style="font-size:11px;color:#8A8A9A;letter-spacing:0.2em;text-transform:uppercase;">Kingdom Operating System</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h1 style="font-family:'Cinzel',serif;font-size:22px;font-weight:600;color:#F5F0E6;margin:0 0 20px;line-height:1.3;">${headline}</h1>
              <div style="font-size:15px;color:#B0B0B0;line-height:1.8;margin-bottom:28px;">
                ${body}
              </div>

              ${cta ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#D4AF37;border-radius:8px;text-align:center;">
                    <a href="${cta.url}" style="display:inline-block;padding:16px 36px;color:#0A0A0F;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.05em;border-radius:8px;">${cta.text}</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:12px;color:#8A8A9A;margin-top:16px;">
                Or copy and paste this link:<br/>
                <span style="color:#D4AF37;word-break:break-all;">${cta.url}</span>
              </p>
              ` : ""}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#1E1E2E;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="font-size:12px;color:#8A8A9A;margin:0 0 8px;line-height:1.6;">
                This message was sent from your Throne Notes command center.
              </p>
              <p style="font-size:11px;color:#5A5A6A;margin:0;">
                &copy; ${new Date().getFullYear()} Throne Notes. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── VERIFICATION EMAIL ───────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${baseUrl()}/api/auth/verify-email?token=${token}`;

  const html = throneEmail(
    "Verify Your Throne",
    "Activate Your Kingdom Account",
    `<p style="margin-bottom:16px;">You are one step away from entering the Throne Room.</p>
     <p style="margin-bottom:16px;">Your account has been created, but we need to confirm your email before you can access your command center. Click the seal below to verify and activate your throne.</p>
     <p style="margin-bottom:16px;color:#8A8A9A;font-size:13px;">This verification link will remain active for 24 hours.</p>`,
    { text: "VERIFY EMAIL ADDRESS", url }
  );

  if (!resend) {
    console.log(`[DEV EMAIL] Verify ${email}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: fromAddress(),
    to: email,
    subject: "Verify your Throne Notes account",
    html,
  });
}

// ─── WELCOME EMAIL ────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name?: string | null) {
  const firstName = name?.split(" ")[0] || "King";

  const html = throneEmail(
    "Welcome to the Throne Room",
    `Welcome, ${firstName}`,
    `<p style="margin-bottom:16px;">Your throne is now active. You have entered the Kingdom Operating System — a prophetic command center built for revelation, writing, and spiritual intelligence.</p>
     <p style="margin-bottom:16px;"><strong style="color:#D4AF37;">Here is what awaits you:</strong></p>
     <ul style="color:#B0B0B0;padding-left:20px;margin-bottom:20px;line-height:2;">
       <li><strong style="color:#F5F0E6;">Scribe Studio</strong> — Write books chapter by chapter with revelation linking</li>
       <li><strong style="color:#F5F0E6;">Dream Vault</strong> — Capture dreams, visions, and spiritual states</li>
       <li><strong style="color:#F5F0E6;">Blueprint Engine</strong> — Calculate your Life Path, Expression, and daily numbers</li>
       <li><strong style="color:#F5F0E6;">The Oracle</strong> — Receive prophetic intelligence on your revelations</li>
     </ul>
     <p style="margin-bottom:16px;">Your revelations become books. Your books become movements.</p>`,
    { text: "ENTER THE THRONE ROOM", url: baseUrl() }
  );

  if (!resend) {
    console.log(`[DEV EMAIL] Welcome ${email}`);
    return;
  }

  await resend.emails.send({
    from: fromAddress(),
    to: email,
    subject: "Welcome to Throne Notes — Your throne is active",
    html,
  });
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${baseUrl()}/reset-password?token=${token}`;

  const html = throneEmail(
    "Reset Your Seal",
    "Password Reset Request",
    `<p style="margin-bottom:16px;">We received a request to reset the password for your Throne Notes account.</p>
     <p style="margin-bottom:16px;">If you made this request, click the button below to create a new password. If you did not request this, you can safely ignore this email — your account remains secure.</p>
     <p style="margin-bottom:16px;color:#8A8A9A;font-size:13px;"><strong style="color:#B87333;">This link expires in 1 hour.</strong></p>`,
    { text: "RESET PASSWORD", url }
  );

  if (!resend) {
    console.log(`[DEV EMAIL] Reset ${email}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: fromAddress(),
    to: email,
    subject: "Reset your Throne Notes password",
    html,
  });
}
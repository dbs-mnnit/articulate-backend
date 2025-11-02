// emails/verificationEmail.js
// Simple, centered, gradient-branded verification email with a single-click verify link.

export function buildVerificationEmail(token) {
  if (!token) {
    throw new Error("buildVerificationEmail: 'token' is required");
  }

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(
    token
  )}`;

  // Tailwind theme translation:
  // bg-gradient-to-r from-sky-950 to bg-sky-900
  const gradFrom = "#082F49"; // sky-950
  const gradTo = "#0C4A6E";   // sky-900
  const cardBg = "#0b1220";
  const border = "#123047";
  const textMain = "#E6F1FA";
  const textSub = "#93B3C8";

  const subject = "Verify your email";

  // Plaintext fallback
  const text = [
    "Welcome!",
    "",
    "Confirm your email by opening the link below:",
    verifyUrl,
    "",
    "For security, the link may expire soon. If you didn’t request this, you can ignore this email."
  ].join("\n");

  // HTML version
  const html = `
  <div style="margin:0;padding:24px 0;background-color:${gradFrom};background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width:100%;max-width:600px;margin:0 auto;background:${cardBg};border:1px solid ${border};border-radius:14px;overflow:hidden;text-align:center;">
      <tr>
        <td style="padding:22px;background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);color:#fff;">
          <div style="font-size:16px;font-weight:700;">Welcome</div>
          <div style="opacity:.85;font-size:12px;margin-top:4px;">Verify your email to activate your account</div>
        </td>
      </tr>

      <tr>
        <td style="padding:28px;">
          <div style="color:${textMain};font-size:16px;font-weight:600;margin-bottom:8px;">Confirm your email</div>
          <div style="color:${textSub};font-size:13px;line-height:1.55;margin:0 auto 18px;max-width:440px;">
            Tap the button to verify your email and finish setting up your account.
          </div>

          <div style="margin-bottom:20px;">
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;text-decoration:none;color:#fff;font-weight:700;background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);">
              Verify Email
            </a>
          </div>

          <div style="color:${textSub};font-size:12px;line-height:1.55;word-break:break-all;max-width:480px;margin:0 auto;">
            Or paste this link into your browser:<br />
            <a href="${verifyUrl}" style="color:${textSub};text-decoration:underline;">${verifyUrl}</a>
          </div>

          <hr style="border:none;border-top:1px solid ${border};margin:24px 0;" />

          <div style="color:${textSub};font-size:11px;line-height:1.55;">
            If you didn’t request this, you can safely ignore this email.
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:16px;background:${gradFrom};text-align:center;">
          <div style="color:#6b9db8;font-size:11px;">© ${new Date().getFullYear()} All rights reserved.</div>
        </td>
      </tr>
    </table>
  </div>
  `;

  return { subject, text, html };
}

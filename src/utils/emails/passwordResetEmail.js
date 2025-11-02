// emails/passwordResetEmail.js
// Simple, centered, gradient-branded reset email with a clear CTA.

export function buildPasswordResetEmail(token) {
  if (!token) {
    throw new Error("buildPasswordResetEmail: 'token' is required");
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
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

  const subject = "Reset your password";

  const text = [
    "You requested a password reset.",
    "",
    "To continue, open the link below:",
    resetUrl,
    "",
    "This link will expire in 1 hour.",
    "If you didn’t request this, you can ignore this email."
  ].join("\n");

  const html = `
  <div style="margin:0;padding:24px 0;background-color:${gradFrom};background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width:100%;max-width:600px;margin:0 auto;background:${cardBg};border:1px solid ${border};border-radius:14px;overflow:hidden;text-align:center;">
      <tr>
        <td style="padding:22px;background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);color:#fff;">
          <div style="font-size:16px;font-weight:700;">Password Reset</div>
          <div style="opacity:.85;font-size:12px;margin-top:4px;">You asked to reset your password</div>
        </td>
      </tr>

      <tr>
        <td style="padding:28px;">
          <div style="color:${textMain};font-size:16px;font-weight:600;margin-bottom:8px;">Reset your password</div>
          <div style="color:${textSub};font-size:13px;line-height:1.55;margin:0 auto 18px;max-width:440px;">
            Click the button below to choose a new password. This link expires in 1 hour.
          </div>

          <div style="margin-bottom:20px;">
            <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;text-decoration:none;color:#fff;font-weight:700;background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);">
              Reset Password
            </a>
          </div>

          <div style="color:${textSub};font-size:12px;line-height:1.55;word-break:break-all;max-width:480px;margin:0 auto;">
            Or paste this link into your browser:<br />
            <a href="${resetUrl}" style="color:${textSub};text-decoration:underline;">${resetUrl}</a>
          </div>

          <hr style="border:none;border-top:1px solid ${border};margin:24px 0;" />

          <div style="color:${textSub};font-size:11px;line-height:1.55;">
            If you didn’t request this, you can ignore this email. Your password won’t change.
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

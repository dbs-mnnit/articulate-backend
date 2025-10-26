// emails/passwordResetEmail.js
//
// Generates the "reset your password" email.
// We include a CTA button and a plaintext link fallback.
// We assume FRONTEND_URL is something like https://app.articulate.ai
// and that the frontend has a /reset-password route accepting ?token=...

export function buildPasswordResetEmail(token) {
  if (!token) {
    throw new Error("buildPasswordResetEmail: 'token' is required");
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
    token
  )}`;

  const subject = "Reset your Articulate password";

  const text = [
    "You requested a password reset for your Articulate account.",
    "",
    "To continue, open the link below:",
    resetUrl,
    "",
    "This link will expire in 1 hour.",
    "If you didn’t request a reset, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="background-color:#0f172a; padding:24px 0; margin:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width:100%; max-width:600px; background-color:#1e253a; border:1px solid #2f354d; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:20px 24px; background:linear-gradient(90deg,#5b21b6 0%,#be123c 100%); color:#fff; font-size:14px; font-weight:600;">
            <div style="font-size:14px; font-weight:600; color:#fff;">
              Password Reset
            </div>
            <div style="font-size:12px; font-weight:400; color:rgba(255,255,255,0.8); margin-top:4px;">
              You asked to reset your Articulate password
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;">
            <div style="color:#f8fafc; font-size:15px; font-weight:500; margin-bottom:8px;">
              Reset your password
            </div>

            <div style="color:#94a3b8; font-size:13px; line-height:1.5; margin-bottom:16px;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link will expire in 1 hour.
            </div>

            <div style="text-align:center; margin-bottom:20px;">
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  background:linear-gradient(90deg,#5b21b6 0%,#be123c 100%);
                  color:#fff;
                  font-size:14px;
                  font-weight:600;
                  text-decoration:none;
                  padding:12px 16px;
                  border-radius:8px;
                  box-shadow:0 10px 25px rgba(190,18,60,0.3);
                "
              >
                Reset Password
              </a>
            </div>

            <div style="color:#94a3b8; font-size:12px; line-height:1.5; word-break:break-all;">
              Or paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color:#94a3b8; text-decoration:underline; word-break:break-all;">
                ${resetUrl}
              </a>
            </div>

            <div style="color:#94a3b8; font-size:12px; line-height:1.5; margin-top:20px;">
              If you didn’t request this, you can ignore this email. Your password won’t change.
            </div>

            <hr style="border:none; border-top:1px solid #2f354d; margin:24px 0;" />

            <div style="color:#64748b; font-size:11px; line-height:1.5;">
              This email was sent because a password reset was requested for your Articulate account.
            </div>
          </td>
        </tr>

        <tr>
          <td style="background-color:#0f172a; padding:16px 24px; text-align:center;">
            <div style="color:#475569; font-size:11px; line-height:1.5;">
              © ${new Date().getFullYear()} Articulate. All rights reserved.
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return { subject, text, html };
}

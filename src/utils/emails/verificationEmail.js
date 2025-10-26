// emails/verificationEmail.js
//
// Generates the "verify your email" message with an OTP code.
// This file ONLY builds subject/text/html.
// Delivery happens in emails.js via sendVerificationEmail().

export function buildVerificationEmail(otp) {
  if (!otp) {
    throw new Error("buildVerificationEmail: 'otp' is required");
  }

  const subject = "Your Articulate verification code";

  // Plaintext fallback (for clients that block HTML)
  const text = [
    "Welcome to Articulate 💜",
    "",
    `Your verification code is: ${otp}`,
    "",
    "This code expires in 15 minutes.",
    "If you didn't request this, you can safely ignore this email.",
  ].join("\n");

  // HTML version
  // Design goals:
  // - 600px centered card
  // - Soft dark header bar with gradient hint (subtle brand vibe)
  // - Code block that's obvious & accessible
  // - Light reassurance copy
  const html = `
    <div style="background-color:#0f172a; padding:24px 0; margin:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width:100%; max-width:600px; background-color:#1e253a; border:1px solid #2f354d; border-radius:12px; overflow:hidden;">
        <tr>
          <td style="padding:20px 24px; background:linear-gradient(90deg,#5b21b6 0%,#be123c 100%); color:#fff; font-size:14px; font-weight:600;">
            <div style="font-size:14px; font-weight:600; color:#fff;">
              Welcome to Articulate
            </div>
            <div style="font-size:12px; font-weight:400; color:rgba(255,255,255,0.8); margin-top:4px;">
              Verify your email to activate your account
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;">
            <div style="color:#f8fafc; font-size:15px; font-weight:500; margin-bottom:8px;">
              Here's your verification code
            </div>

            <div style="color:#94a3b8; font-size:13px; line-height:1.5; margin-bottom:16px;">
              Enter this code in the app to confirm it's really you. The code will expire in 15 minutes.
            </div>

            <div style="display:inline-block; background-color:#0f172a; border:1px solid #334155; border-radius:8px; padding:12px 16px; font-size:20px; font-weight:600; letter-spacing:2px; color:#fff; text-align:center; font-family:monospace;">
              ${otp}
            </div>

            <div style="color:#94a3b8; font-size:12px; line-height:1.5; margin-top:20px;">
              If you didn’t request this code, you can safely ignore this email.
            </div>

            <hr style="border:none; border-top:1px solid #2f354d; margin:24px 0;" />

            <div style="color:#64748b; font-size:11px; line-height:1.5;">
              You’re receiving this because someone tried to sign up for an Articulate account with this email.
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

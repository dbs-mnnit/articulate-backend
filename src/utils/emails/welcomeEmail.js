// emails/welcomeEmail.js

export function buildWelcomeEmail(firstName) {
  if (!firstName) {
    throw new Error("buildWelcomeEmail: 'firstName' is required");
  }

  const gradFrom = "#082F49"; // sky-950
  const gradTo = "#0C4A6E";   // sky-900
  const textMain = "#E6F1FA";
  const textSub = "#93B3C8";
  const border = "#123047";
  const cardBg = "#0b1220";

  const subject = `Welcome to Articulate, ${firstName}!`;

  const text = [
    `Hi ${firstName},`,
    "",
    "Welcome to Articulate — the self care you need.",
    "",
    "You now have a private space to capture what you feel in real time, before it fades or gets rewritten.",
    "",
    "Log a moment. Reflect later. Heal on your own terms.",
    "",
    "We’re honored to be part of your clarity journey.",
    "",
    "— The Articulate Team"
  ].join("\n");

  const html = `
  <div style="margin:0;padding:24px 0;background-color:${gradFrom};
              background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);
              font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" 
           align="center" style="width:100%;max-width:600px;margin:0 auto;
           background:${cardBg};border:1px solid ${border};
           border-radius:14px;overflow:hidden;text-align:center;">
      <tr>
        <td style="padding:30px;background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);">
          <img src="https://ik.imagekit.io/articulate/Articulate_Full_Logo.png" 
               alt="Articulate Logo" width="160" style="display:block;margin:0 auto 10px;" />
          <div style="color:#93C5FD;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
            The Self Care You Need
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:36px 28px;">
          <h1 style="color:${textMain};font-size:22px;font-weight:700;margin-bottom:8px;">
            Hi ${firstName},
          </h1>

          <p style="color:${textMain};font-size:15px;line-height:1.6;margin:0 auto 14px;max-width:460px;">
            Welcome to <strong>Articulate</strong> — a private layer between “I felt this” and “I understand this.”
          </p>

          <p style="color:${textSub};font-size:13px;line-height:1.6;margin:0 auto 20px;max-width:460px;">
            You now have a space where it’s safe to tell the truth, without judgment, performance, or noise.
            Capture moments as they happen. Add clarity later. See your own patterns and progress.
          </p>

          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display:inline-block;padding:12px 22px;border-radius:10px;
             background-image:linear-gradient(90deg, ${gradFrom} 0%, ${gradTo} 100%);
             color:#fff;text-decoration:none;font-weight:600;">
             Go to Dashboard
          </a>

          <div style="margin-top:28px;color:${textSub};font-size:12px;line-height:1.6;max-width:460px;margin-left:auto;margin-right:auto;">
            We built Articulate because you deserve more than “it’s fine.”  
            This is your safe space to feel, reflect, and grow — privately.
          </div>

          <hr style="border:none;border-top:1px solid ${border};margin:30px 0;" />

          <p style="color:${textSub};font-size:12px;line-height:1.6;margin:0 auto;max-width:460px;">
            With care,<br />
            <strong>The Articulate Team</strong><br />
            <span style="color:#64748b;font-size:11px;">Private. Encrypted. Yours only.</span>
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:16px;background:${gradFrom};text-align:center;">
          <div style="color:#6b9db8;font-size:11px;">
            © ${new Date().getFullYear()} Articulate. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;

  return { subject, text, html };
}

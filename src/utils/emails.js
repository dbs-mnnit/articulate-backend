// services/emails.js
import { sendEmail } from "../configs/awsses.js";
import { buildVerificationEmail } from "./emails/verificationEmail.js";
import { buildPasswordResetEmail } from "./emails/passwordResetEmail.js";

/**
 * Simple helpers to show what's happening
 */
function short(addr) {
  if (!addr) return "***";
  const s = Array.isArray(addr) ? addr[0] : addr;
  return typeof s === "string" ? `${s.split("@")[0] || "*"}@***` : "***";
}

export async function sendVerificationEmail(to, otp, opts = {}) {
  console.log(`[Emails] Preparing verification email -> to=${short(to)} otp=${otp ? "yes" : "no"}`);

  if (!to) {
    console.log("[Emails] Missing 'to' for verification email. Abort.");
    throw new Error("sendVerificationEmail: 'to' is required");
  }
  if (!otp) {
    console.log("[Emails] Missing 'otp' for verification email. Abort.");
    throw new Error("sendVerificationEmail: 'otp' is required");
  }

  const { subject, text, html } = buildVerificationEmail(otp);
  console.log(
    `[Emails] Built verification email -> subject="${subject}" html=${Boolean(html)} text=${Boolean(
      text
    )}`
  );

  try {
    const res = await sendEmail({
      to,
      subject,
      text,
      html,
      dryRun: opts.dryRun === true,
    });
    console.log(
      `[Emails] Verification email sent -> dryRun=${!!res?.dryRun} messageId=${res?.MessageId || "n/a"}`
    );
    return res;
  } catch (err) {
    console.log(
      `[Emails] Verification email FAILED -> name=${err?.name || "Error"} message=${
        err?.message || "Unknown"
      }`
    );
    throw err;
  }
}

export async function sendPasswordResetEmail(to, token, opts = {}) {
  console.log(
    `[Emails] Preparing password reset email -> to=${short(to)} token=${token ? "yes" : "no"}`
  );

  if (!to) {
    console.log("[Emails] Missing 'to' for password reset email. Abort.");
    throw new Error("sendPasswordResetEmail: 'to' is required");
  }
  if (!token) {
    console.log("[Emails] Missing 'token' for password reset email. Abort.");
    throw new Error("sendPasswordResetEmail: 'token' is required");
  }

  const { subject, text, html } = buildPasswordResetEmail(token);
  console.log(
    `[Emails] Built reset email -> subject="${subject}" html=${Boolean(html)} text=${Boolean(text)}`
  );

  try {
    const res = await sendEmail({
      to,
      subject,
      text,
      html,
      dryRun: opts.dryRun === true,
    });
    console.log(
      `[Emails] Password reset email sent -> dryRun=${!!res?.dryRun} messageId=${
        res?.MessageId || "n/a"
      }`
    );
    return res;
  } catch (err) {
    console.log(
      `[Emails] Password reset email FAILED -> name=${err?.name || "Error"} message=${
        err?.message || "Unknown"
      }`
    );
    throw err;
  }
}

/**
 * Optional utility for any ad-hoc email you send elsewhere in the app
 */
export async function sendGenericEmail({ to, subject, text, html, dryRun = false }) {
  console.log(
    `[Emails] Preparing generic email -> to=${short(to)} subject="${subject || "(no subject)"}"`
  );
  try {
    const res = await sendEmail({ to, subject, text, html, dryRun });
    console.log(
      `[Emails] Generic email sent -> dryRun=${!!res?.dryRun} messageId=${res?.MessageId || "n/a"}`
    );
    return res;
  } catch (err) {
    console.log(
      `[Emails] Generic email FAILED -> name=${err?.name || "Error"} message=${
        err?.message || "Unknown"
      }`
    );
    throw err;
  }
}

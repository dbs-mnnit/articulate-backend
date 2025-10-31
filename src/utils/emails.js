// utils/emails.js
// Thin orchestration layer that builds specific messages and delivers via SES.
// Uses your existing builders.

import { sendEmail, short } from "../configs/awsses.js";
import { buildVerificationEmail } from "./emails/verificationEmail.js";
import { buildPasswordResetEmail } from "./emails/passwordResetEmail.js";

/**
 * Send the "verify your email" OTP
 * @param {string|string[]} to
 * @param {string} otp
 * @param {{dryRun?: boolean}} [opts]
 */
export async function sendVerificationEmail(to, otp, opts = {}) {
  //console.log(`[Emails] Preparing verification email -> to=${short(to)} otp=${otp ? "yes" : "no"}`);

  if (!to) throw new Error("sendVerificationEmail: 'to' is required");
  if (!otp) throw new Error("sendVerificationEmail: 'otp' is required");

  const { subject, text, html } = buildVerificationEmail(otp);
  const res = await sendEmail({ to, subject, text, html, dryRun: opts.dryRun === true });

  //console.log(`[Emails] Verification email sent -> dryRun=${!!res?.dryRun} messageId=${res?.MessageId || "n/a"}`);
  return res;
}

/**
 * Send the "reset password" email with tokenized link
 * @param {string|string[]} to
 * @param {string} token
 * @param {{dryRun?: boolean}} [opts]
 */
export async function sendPasswordResetEmail(to, token, opts = {}) {
  //console.log(`[Emails] Preparing password reset email -> to=${short(to)} token=${token ? "yes" : "no"}`);

  if (!to) throw new Error("sendPasswordResetEmail: 'to' is required");
  if (!token) throw new Error("sendPasswordResetEmail: 'token' is required");

  const { subject, text, html } = buildPasswordResetEmail(token);
  const res = await sendEmail({ to, subject, text, html, dryRun: opts.dryRun === true });

  //console.log(`[Emails] Password reset email sent -> dryRun=${!!res?.dryRun} messageId=${res?.MessageId || "n/a"}`);
  return res;
}

/**
 * Generic catch-all email helper
 * @param {{to:string|string[], subject:string, text?:string, html?:string, dryRun?:boolean}} args
 */
export async function sendGenericEmail({ to, subject, text, html, dryRun = false }) {
  console.log(`[Emails] Preparing generic email -> to=${short(to)} subject="${subject || "(no subject)"}"`);

  const res = await sendEmail({ to, subject, text, html, dryRun });
  console.log(`[Emails] Generic email sent -> dryRun=${!!res?.dryRun} messageId=${res?.MessageId || "n/a"}`);
  return res;
}

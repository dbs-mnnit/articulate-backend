// utils/emails.js
// Thin orchestration layer that builds specific messages and delivers via SES.

import { sendEmail, short } from "../configs/awsses.js";
import { buildVerificationEmail } from "./emails/verificationEmail.js";
import { buildPasswordResetEmail } from "./emails/passwordResetEmail.js";
import { buildWelcomeEmail } from "./emails/welcomeEmail.js";

/**
 * Send the "verify your email" message with a tokenized link
 * @param {string|string[]} to
 * @param {string} token
 * @param {{dryRun?: boolean}} [opts]
 */
export async function sendVerificationEmail(to, token, opts = {}) {
  if (!to) throw new Error("sendVerificationEmail: 'to' is required");
  if (!token) throw new Error("sendVerificationEmail: 'token' is required");

  const { subject, text, html } = buildVerificationEmail(token);
  const res = await sendEmail({
    to,
    subject,
    text,
    html,
    dryRun: opts.dryRun === true,
  });
  return res;
}

/**
 * Send the "reset password" email with tokenized link
 * @param {string|string[]} to
 * @param {string} token
 * @param {{dryRun?: boolean}} [opts]
 */
export async function sendPasswordResetEmail(to, token, opts = {}) {
  if (!to) throw new Error("sendPasswordResetEmail: 'to' is required");
  if (!token) throw new Error("sendPasswordResetEmail: 'token' is required");

  const { subject, text, html } = buildPasswordResetEmail(token);
  const res = await sendEmail({
    to,
    subject,
    text,
    html,
    dryRun: opts.dryRun === true,
  });
  return res;
}

/**
 * Send the "welcome" email (no unsubscribe needed; transactional)
 * @param {string|string[]} to
 * @param {string} firstName
 * @param {{dryRun?: boolean}} [opts]
 */
export async function sendWelcomeEmail(to, firstName, opts = {}) {
  if (!to) throw new Error("sendWelcomeEmail: 'to' is required");
  if (!firstName) throw new Error("sendWelcomeEmail: 'firstName' is required");

  const { subject, text, html } = buildWelcomeEmail(firstName);
  const res = await sendEmail({
    to,
    subject,
    text,
    html,
    dryRun: opts.dryRun === true,
  });
  return res;
}

/**
 * Generic catch-all email helper
 * @param {{to:string|string[], subject:string, text?:string, html?:string, dryRun?:boolean}} args
 */
export async function sendGenericEmail({ to, subject, text, html, dryRun = false }) {
  if (!to) throw new Error("sendGenericEmail: 'to' is required");
  const res = await sendEmail({ to, subject, text, html, dryRun });
  return res;
}

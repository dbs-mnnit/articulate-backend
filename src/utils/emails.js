// email templates for different event 
// emails.js
//
// Central email orchestration layer.
// This file exposes high-level senders that the rest of the app can call,
// but delegates the actual template/content to individual email modules.
// That keeps authService clean and lets design/branding live in isolated files
// that match the Articulate frontend theme.
//
// Expected supporting files (you'll create these separately):
//   ./emails/verificationEmail.js
//      export function buildVerificationEmail(otp) { return { subject, text, html }; }
//
//   ./emails/passwordResetEmail.js
//      export function buildPasswordResetEmail(token) { return { subject, text, html }; }
//
// Also relies on nodemailer.js for actually delivering mail:
//   sendEmail({ to, subject, text, html })
//
// NOTE: Do not put HTML here. Do not hardcode copy here.
//       This file should stay lightweight, stable, and framework-safe.

import { sendEmail } from "../configs/nodemailer.js";
import { buildVerificationEmail } from "./emails/verificationEmail.js";
import { buildPasswordResetEmail } from "./emails/passwordResetEmail.js";

/**
 * Send the email verification code to a user.
 * @param {string} to  - recipient email
 * @param {string} otp - 6-digit code
 */
export async function sendVerificationEmail(to, otp) {
  if (!to) throw new Error("sendVerificationEmail: 'to' is required");
  if (!otp) throw new Error("sendVerificationEmail: 'otp' is required");

  const { subject, text, html } = buildVerificationEmail(otp);

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send the password reset email with a secure reset token.
 * @param {string} to    - recipient email
 * @param {string} token - password reset token used to build reset URL
 */
export async function sendPasswordResetEmail(to, token) {
  if (!to) throw new Error("sendPasswordResetEmail: 'to' is required");
  if (!token)
    throw new Error("sendPasswordResetEmail: 'token' is required");

  const { subject, text, html } = buildPasswordResetEmail(token);

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
}

// You can keep growing this file by adding more named exports, for example:
// export async function sendWeeklyMoodDigestEmail(to, data) { ... }
// export async function sendStreakCongratsEmail(to, streakCount) { ... }
//
// Each one imports its own build*Email() from /emails/... and then calls sendEmail.
// That way authService / notification jobs only ever import from this single module.

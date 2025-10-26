// nodemailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Create a single transporter instance for the whole app.
 * We assume you've set:
 * SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Notes:
 * - SMTP_SECURE should be "true" for port 465 and "false" for 587 typically.
 * - We defensively strip quotes in case env vars were injected with quotes.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: (process.env.SMTP_USER || "").replace(/"/g, ""),
    pass: (process.env.SMTP_PASS || "").replace(/"/g, ""),
  },
});

/**
 * sendEmail
 * @param {Object} options
 * @param {string} options.to          - recipient email
 * @param {string} options.subject     - email subject
 * @param {string} [options.text]      - plain text body
 * @param {string} [options.html]      - html body
 * @param {string} [options.from]      - override default From
 */
export async function sendEmail({ to, subject, text, html, from }) {
  if (!to) throw new Error("sendEmail: 'to' is required");
  if (!subject) throw new Error("sendEmail: 'subject' is required");

  const mailOptions = {
    from: from || process.env.SMTP_FROM,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  await transporter.sendMail(mailOptions);
}

export default transporter;

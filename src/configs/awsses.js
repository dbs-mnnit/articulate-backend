// config/awsses.js
// Minimal SES v2 sender used by the app. Validates inputs, supports dry-run,
// and respects env: AWS_REGION, SES_FROM, SES_CONFIGURATION_SET, SES_REPLY_TO.
// If you use temporary creds, set AWS_SESSION_TOKEN as well.

import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

// Load .env if present (optional; safe in dev)
try { require("dotenv").config(); } catch (_) {}

const env = (k, def = "") => (process.env[k] ?? def).toString().trim();
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const REGION = env("AWS_REGION", "us-east-1");
const SES_FROM = env("SES_FROM"); // e.g. Articulate <noreply@himansu.in>
assert(SES_FROM, "SES_FROM is required (e.g. Name <sender@domain>)");

const REPLY_TO = env("SES_REPLY_TO") || undefined;
const CONFIG_SET = env("SES_CONFIGURATION_SET") || undefined;

// If you prefer letting the SDK read env creds automatically, you can omit "credentials" here.
const client = new SESv2Client({
  region: REGION,
  credentials: {
    accessKeyId: env("AWS_ACCESS_KEY_ID"),
    secretAccessKey: env("AWS_SECRET_ACCESS_KEY"),
    
  },
});

/**
 * Send an email via SES v2
 * @param {Object} args
 * @param {string|string[]} args.to - recipient(s)
 * @param {string} args.subject
 * @param {string} [args.text]
 * @param {string} [args.html]
 * @param {boolean} [args.dryRun=false] - if true, don't call SES; just echo params
 * @returns {Promise<{MessageId?: string, dryRun?: boolean}>}
 */
export async function sendEmail({ to, subject, text, html, dryRun = false }) {
  assert(to, "sendEmail: 'to' is required");
  assert(subject, "sendEmail: 'subject' is required");
  assert(text || html, "sendEmail: either 'text' or 'html' must be provided");

  const toList = Array.isArray(to) ? to : [to];

  const params = {
    FromEmailAddress: SES_FROM,                   // supports "Name <email@domain>"
    Destination: { ToAddresses: toList },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
          ...(html ? { Html: { Data: html, Charset: "UTF-8" } } : {}),
        },
      },
    },
  };

  if (REPLY_TO) params.ReplyToAddresses = [REPLY_TO];
  if (CONFIG_SET) params.ConfigurationSetName = CONFIG_SET;

  if (dryRun) {
    // Useful for unit tests and local dev
    return { dryRun: true };
  }

  const cmd = new SendEmailCommand(params);
  const res = await client.send(cmd);
  return res; // contains MessageId
}

// Optional: small helper for masking emails in logs
export function short(addr) {
  if (!addr) return "***";
  const s = Array.isArray(addr) ? addr[0] : addr;
  return typeof s === "string" ? `${s.split("@")[0] || "*"}@***` : "***";
}

// configs/awsses.js
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import dotenv from "dotenv";
dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";

const ses = new SESv2Client({
  region,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
        }
      : undefined,
});

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v];
}

function mask(addr) {
  if (!addr || !addr.includes("@")) return "***";
  const [u, d] = addr.split("@");
  return `${(u[0] || "*")}***@${d}`;
}

function maskList(list) {
  return asArray(list).map(mask).join(", ");
}

/**
 * Simple SES sender with very basic console logs
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
  cc,
  bcc,
  replyTo,
  headers,
  configurationSetName,
  tags,
  dryRun = false,
}) {
  const fromAddress = from || process.env.SES_FROM;

  // Basic validation with logs
  if (!to) {
    console.log("[SES] Missing 'to' field. Abort.");
    throw new Error("sendEmail: 'to' is required");
  }
  if (!subject) {
    console.log("[SES] Missing 'subject' field. Abort.");
    throw new Error("sendEmail: 'subject' is required");
  }
  if (!fromAddress) {
    console.log("[SES] Missing 'from' (and SES_FROM not set). Abort.");
    throw new Error("sendEmail: 'from' or SES_FROM is required");
  }

  const toArr = asArray(to);
  const ccArr = asArray(cc);
  const bccArr = asArray(bcc);
  const replyToArr = asArray(replyTo);

  console.log(`[SES] Region: ${region}`);
  console.log(`[SES] From: ${mask(fromAddress)}`);
  console.log(`[SES] To: ${maskList(toArr)}`);
  if (ccArr.length) console.log(`[SES] CC: ${maskList(ccArr)}`);
  if (bccArr.length) console.log(`[SES] BCC: ${maskList(bccArr)}`);
  if (replyToArr.length) console.log(`[SES] Reply-To: ${maskList(replyToArr)}`);
  console.log(`[SES] Subject: "${subject}"`);
  console.log(`[SES] Body parts -> html: ${Boolean(html)} text: ${Boolean(text)}`);
  if (configurationSetName || process.env.SES_CONFIGURATION_SET) {
    console.log(
      `[SES] Using configuration set: ${configurationSetName || process.env.SES_CONFIGURATION_SET}`
    );
  }
  if (dryRun) {
    console.log("[SES] Dry run enabled. Skipping actual send.");
    return { dryRun: true };
  }

  const headerList =
    headers && typeof headers === "object"
      ? Object.entries(headers).map(([Name, value]) => ({ Name, Value: String(value) }))
      : undefined;

  const command = new SendEmailCommand({
    FromEmailAddress: fromAddress,
    Destination: { ToAddresses: toArr, CcAddresses: ccArr, BccAddresses: bccArr },
    ReplyToAddresses: replyToArr,
    EmailTags: Array.isArray(tags) ? tags : undefined,
    ConfigurationSetName: configurationSetName || process.env.SES_CONFIGURATION_SET || undefined,
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          ...(html ? { Html: { Data: html, Charset: "UTF-8" } } : {}),
          ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
        },
        ...(headerList ? { Headers: headerList } : {}),
      },
    },
  });

  console.log("[SES] Sending...");
  try {
    const res = await ses.send(command);
    console.log(
      `[SES] Sent OK. messageId=${res?.MessageId || "n/a"} httpStatus=${
        res?.$metadata?.httpStatusCode || "n/a"
      }`
    );
    return res;
  } catch (err) {
    console.log(
      `[SES] Send FAILED. name=${err?.name || "Error"} message=${err?.message || "Unknown"}`
    );
    if (err?.$metadata?.requestId) {
      console.log(`[SES] AWS requestId=${err.$metadata.requestId}`);
    }
    // Helpful hints for common issues
    if (String(err?.message || "").includes("MessageRejected")) {
      console.log(
        "[SES] Tip: Check if the recipient or domain is verified, or if your account is still in SES sandbox."
      );
    }
    throw err;
  }
}

export default ses;

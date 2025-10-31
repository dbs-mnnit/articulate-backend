// models/Visitor.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

/**
 * BASIC VISITOR MODEL
 * - Keep it simple: page, referrer, UA, IP (or hash), UTM.
 * - Uses timestamps for createdAt/updatedAt.
 * - Add/extend later without breaking existing data.
 *
 * Note on IP:
 * - If you want to avoid storing raw IPs, store a hash instead (e.g., sha256(ip + secret)).
 * - Below we keep a slot for both; you can choose one and leave the other empty.
 */

const VisitorSchema = new Schema(
  {
    // Session-ish identifiers (optional but helpful)
    visitId: { type: String, index: true },        // generate per page load on client
    sessionId: { type: String, index: true },      // cookie/localStorage across pages
    userId: { type: String, index: true },         // your app’s user ID (if logged in)

    // Request basics
    ip: { type: String, index: true },             // or leave blank and use ipHash
    ipHash: { type: String, index: true },         // preferred if you hash IPs
    userAgent: { type: String },                   // req.headers['user-agent']
    acceptLang: { type: String },                  // req.headers['accept-language']

    // Where they came from
    referrer: { type: String },                    // document.referrer (client) or Referer header (server)
    origin: { type: String },                      // req.headers['origin'] (if present)

    // What they viewed
    pageUrl: { type: String, index: true },
    pagePath: { type: String, index: true },       // e.g. /pricing
    pageTitle: { type: String },

    // Basic UTM params
    utmSource: { type: String, index: true },
    utmMedium: { type: String, index: true },
    utmCampaign: { type: String, index: true },
    utmTerm: { type: String },
    utmContent: { type: String },

    // Light geo (optional; populate from IP if you have a geo service)
    country: { type: String, index: true },        // e.g. "US"
    region: { type: String },                      // e.g. "CA"
    city: { type: String },                        // e.g. "San Francisco"
  },
  {
    collection: "visitors",
    timestamps: true,          // createdAt, updatedAt
    versionKey: false,
    minimize: true,
  }
);

// Simple, useful indexes
VisitorSchema.index({ createdAt: -1 });
VisitorSchema.index({ pagePath: 1, createdAt: -1 });
VisitorSchema.index({ utmSource: 1, utmCampaign: 1, createdAt: -1 });

// Light output hygiene (optional)
VisitorSchema.set("toJSON", {
  transform: function (_doc, ret) {
    // very light mask for IPv4; remove if you store only ipHash
    if (ret.ip) ret.ip = ret.ip.replace(/\.\d+$/, ".***");
    return ret;
  },
});

const Visitor = models.Visitor || model("Visitor", VisitorSchema);
export default Visitor;

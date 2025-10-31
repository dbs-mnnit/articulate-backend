// services/visitorServices.js
import visitorRepo from './visitorRepo.js'; // Adjust path as needed
import createError from 'http-errors';
import crypto from 'crypto';

class VisitorService {
  async createVisitor(visitorData, req) {
    // Add server-side data
    const ip = req.ip || req.connection.remoteAddress;
    const secret = process.env.IP_HASH_SECRET || 'your-secret-key-here'; // Set in env for security
    visitorData.ipHash = crypto.createHash('sha256').update(ip + secret).digest('hex');
    // Do not store raw IP to comply with privacy; use ipHash instead
    visitorData.ip = undefined;

    visitorData.userAgent = req.headers['user-agent'];
    visitorData.acceptLang = req.headers['accept-language'];
    visitorData.origin = req.headers.origin || req.headers['Origin'];
    // referrer can be from req.headers.referer if not provided in body
    if (!visitorData.referrer) {
      visitorData.referrer = req.headers.referer;
    }

    // Optional: Populate geo from IP (requires a geo service like geoip-lite or MaxMind)
    // Example (uncomment and install geoip-lite if needed):
    // const geoip = require('geoip-lite');
    // const geo = geoip.lookup(ip);
    // if (geo) {
    //   visitorData.country = geo.country;
    //   visitorData.region = geo.region;
    //   visitorData.city = geo.city;
    // }

    // If auth token was provided and validated (assuming optional auth middleware sets req.user), add userId
    // Note: For this to work, implement an optionalAuthMiddleware that sets req.user if token is valid, else skips.
    // For now, assume userId is optionally sent in body (not secure; recommend optional auth).
    if (req.user && req.user.id) {
      visitorData.userId = req.user.id;
    }

    const visitor = await visitorRepo.createVisitor(visitorData);
    return visitor;
  }

  async getVisitor(id) {
    const visitor = await visitorRepo.findVisitorById(id);
    if (!visitor) {
      throw createError(404, 'Visitor not found');
    }
    return visitor;
  }

  async getVisitors(filters, page, limit) {
    return await visitorRepo.findVisitors(filters, page, limit);
  }
}

export default new VisitorService();
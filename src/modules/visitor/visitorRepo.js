// repositories/visitorRepo.js
import Visitor from '../../models/Visitor.js'; // Adjust path as needed

class VisitorRepository {
  async createVisitor(visitorData) {
    return await Visitor.create(visitorData);
  }

  async findVisitorById(id) {
    return await Visitor.findById(id);
  }

  async findVisitors(filters = {}, page = 1, limit = 10) {
    const query = {};
    if (filters.pagePath) {
      query.pagePath = filters.pagePath;
    }
    if (filters.utmSource) {
      query.utmSource = filters.utmSource;
    }
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    return await Visitor.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}

export default new VisitorRepository();
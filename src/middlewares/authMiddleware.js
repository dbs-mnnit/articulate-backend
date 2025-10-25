import authRepo from '../modules/auth/authRepo.js'
import jwt from 'jsonwebtoken'
// Middleware to verify access token
const authenticateToken = async (req, res, next) => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  if (await authRepo.isTokenBlacklisted(token)) {
    return res.status(403).json({
      success: false,
      message: 'Blacklisted access token'
    });
  }
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;

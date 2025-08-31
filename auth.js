// auth.js or middleware.js
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for JWT handling

// Middleware to authorize based on allowed roles
function authorize(allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization; // Get Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' }); // No token found
    }
    const token = authHeader.split(' ')[1]; // Extract token from header
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode token
      req.user = decoded; // Attach decoded user info to request
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' }); // Role not allowed
      }
      next(); // Proceed to next middleware/route
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' }); // Token invalid or expired
    }
  };
}

// Export the authorize middleware
module.exports = { authorize };


// const jwt = require('jsonwebtoken');

// // Generating the JWT Token
// function generateToken(payload) {
//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
// }

// // Authenticate Token Middleware
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ error: 'No token provided' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });

//     req.user = user;
//     next();
//   });
// }

// // Authorize Based on Role(s)
// function authorizeRoles(...roles) {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }
//     next();
//   };
// }

// module.exports = {
//   generateToken,
//   authenticateToken,
//   authorizeRoles,
// };

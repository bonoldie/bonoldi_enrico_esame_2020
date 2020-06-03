// Auth Middleware
// Checks if exists a userID
const authMiddleware = (req, res, next) => {
   if(!req.session.isAuthenticated && req.originalUrl != "/login"){
      res.redirect('/login')
   }else {
      next();
   }
}

module.exports = authMiddleware
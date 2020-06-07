// Auth Middleware
const publicRoutes = ['/api/cities', '/login', '/register']

// Checks if exists a userID & route is private
const authMiddleware = (req, res, next) => {
   if (!req.session.isAuthenticated && !publicRoutes.includes(req.originalUrl)) {
      res.redirect('/login')
   } else {
      next();
   }
}

module.exports = authMiddleware
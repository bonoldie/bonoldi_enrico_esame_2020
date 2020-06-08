// Auth Middleware
const publicRoutes = ['/api/cities', '/login', '/register']

// Checks if isAuthenticated && route is public
const authMiddleware = (req, res, next) => {
   if (!req.session.isAuthenticated && !publicRoutes.includes(req.originalUrl)) {
      res.redirect('/login')
   } else {
      next();
   }
}

module.exports = authMiddleware
// Auth Middleware
// Checks if exists a userID
const authMiddleware = (req, res, next) => {
   if(req.session.userID == undefined && req.originalUrl != "/login"){
      res.redirect(400,'/400')
   }
   else
      next();
}

module.exports = authMiddleware
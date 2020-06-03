// Import modules
const express = require("express");
const expressApp = express();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('./libs/authenticate');
const {getUser,findUsers} = require('./libs/user');

require('./libs/setup')(expressApp)

// Routes
expressApp.get('/login', (req, res) => {
   delete req.session.isAuthenticated;
   delete req.session.user;
   expressApp.locals.user = false
   res.render('pages/login', { errors: false })
})

expressApp.post('/login', [
   body('email').isEmail(),
   body('password').isLength({ min: 1 })
], async (req, res) => {
   const inputValidator = validationResult(req);
   
   if (!inputValidator.isEmpty()) {
      //return res.status(401).render('pages/login', { errors: inputValidator.errors });
   }

   const auth = await authenticate("admin@admin.com","admin")//(req.body.email, req.body.password)

   if(auth)
   {
      req.session.isAuthenticated = true
      req.session.user = await getUser(auth.id)
      expressApp.locals.user = await getUser(auth.id)
      res.redirect('/');
   }else{
      req.session.isAuthenticated = false
      expressApp.locals.user = false
      res.render('pages/login', { errors:  [{msg: "Invalid inputs!" ,param:"Email or Password"}] })
   }
})

expressApp.get('/', async (req, res) => {
   res.render('pages/dashboard')
})

expressApp.get('/find/:distance', async (req, res) => {
   const users = await findUsers(req.session.user.id,req.params.distance ? req.params.distance : 10000)
   res.render('pages/find',{users:users,distance: (req.params.distance ? req.params.distance : 10000)})
})

expressApp.get('/user/:userID', async (req, res) => {
   const user = await getUser(req.params.userID)
   
   console.log(user)
   res.render('pages/user',{userData:user})
})

// Finishing up...
expressApp.listen(8080);
console.log("LISTENING ON PORT 8080...");
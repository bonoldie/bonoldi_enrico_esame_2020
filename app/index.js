// Import modules
const fs = require("fs")
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
   res.render('pages/account')
})

expressApp.get('/find', async (req, res) => {
   res.render('pages/find')
})

// Proxy route to handle no img users
expressApp.get('/users/img/:userID',(req,res)=>{
   if(fs.existsSync(`./public/images/users/${req.params.userID}.png`))
      req.url = `/images/users/${req.params.userID}.png`;
   else
      req.url = `/images/users/default.png`
   expressApp.handle(req,res)
})

expressApp.get('/user/:userID', async (req, res) => {
   const user = await getUser(req.params.userID)
   res.render('pages/user',{userData:user})
})



// API
expressApp.get('/api/find/:distance', async (req, res) => {
   const distance = req.params.distance ? req.params.distance : 10000;
   const users = await findUsers(req.session.user.id,distance)
   
   res.contentType('application/json');
   res.status = 200;
   res.send(JSON.stringify({users,distance}))
})

// Finishing up...
expressApp.listen(8080);
console.log("LISTENING ON PORT 8080...");
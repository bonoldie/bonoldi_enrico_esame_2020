// Import modules
const fs = require("fs")
const express = require("express");
const expressApp = express();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('./libs/authenticate');
const { getUser, findUsers } = require('./libs/user');

const multer = require("multer");
const uploadImg = multer({
   storage: multer.diskStorage({
      destination: function (req, file, cb) {
         cb(null, 'public/images/users/')
      },
      filename: function (req, file, cb) {
         cb(null, req.session.user.id.toString() + '.' + file.mimetype.split('/')[1])
      }
   })

}).single('userImg')

require('./libs/setup')(expressApp)
const imgFileReg = /([0-9]+)\.(jpg|gif|png|jpeg)/g

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
      return res.status(401).render('pages/login', { errors: inputValidator.errors });
   }

   const auth = await authenticate(req.body.email, req.body.password)


   if (auth) {
      req.session.isAuthenticated = true
      req.session.user = await getUser(auth.id)
      expressApp.locals.user = await getUser(auth.id)
      res.redirect('/');
   } else {
      req.session.isAuthenticated = false
      expressApp.locals.user = false
      res.render('pages/login', { errors: [{ msg: "Invalid inputs!", param: "Email or Password" }] })
   }
})

expressApp.get('/', async (req, res) => {
   res.render('pages/find')
})


expressApp.get('/profile', async (req, res) => {
   res.render('pages/profile')
})
// Proxy route to handle users imgs 
expressApp.get('/users/img/:userID', (req, res) => {
   const files = fs.readdirSync("./public/images/users/")
   let matches = JSON.stringify(files).toString().matchAll(imgFileReg)

   let img = false
   for (let match of matches) {
      img = (match[1] == req.params.userID && !img ? match : img)
   }

   if (img)
      req.url = `/images/users/${img[1]}.${img[2]}`;
   else
      req.url = `/images/users/default.png`

   expressApp.handle(req, res);
})

// Multer for imgs uploads
expressApp.post('/users/img', uploadImg, (req, res, next) => {
   res.json({ success: true })
   res.status(200)
})


expressApp.get('/user/:userID', async (req, res) => {
   const user = await getUser(req.params.userID)
   res.render('pages/user', { userData: user })
})

// API
expressApp.get('/api/find/:distance', async (req, res) => {
   const distance = req.params.distance ? req.params.distance : 10000;
   const users = await findUsers(req.session.user.id, distance)

   res.contentType('application/json');
   res.status = 200;
   res.send(JSON.stringify({ users, distance }))
})

expressApp.get('/api/find/:distance', async (req, res) => {
   const distance = req.params.distance ? req.params.distance : 10000;
   const users = await findUsers(req.session.user.id, distance)

   res.contentType('application/json');
   res.status = 200;
   res.send(JSON.stringify({ users, distance }))
})

// Finishing up...
let port = process.argv[2] ? process.argv[2] : 8080
expressApp.listen(port);
console.log(`LISTENING ON PORT ${port}...`);
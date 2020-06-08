// Import modules
const fs = require("fs")
const https = require('https');
const express = require("express");
const expressApp = express();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('./libs/authenticate');
const { getUser, findUsers, updateorientamentoSesso, getorientamentoSesso } = require('./libs/user');
const { register } = require('./libs/register');
const { getCities } = require('./libs/city')

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
      expressApp.locals.user = req.session.user
      res.redirect('/');
   } else {
      req.session.isAuthenticated = false
      expressApp.locals.user = false
      res.render('pages/login', { errors: [{ msg: "Invalid inputs!", param: "Email or Password" }] })
   }
})

expressApp.get('/register', (req, res) => {
   res.render('pages/register', { errors: false })
})

expressApp.post('/register', [
   body('email').isEmail().not().isEmpty(),
   body('password').isLength({ min: 8 }).not().isEmpty(),
   body('nome').isString().not().isEmpty(),
   body('cognome').isString().not().isEmpty(),
   body('telefono').isString().not().isEmpty(),
   body('data_nascita').isISO8601().not().isEmpty(),
   body('sesso').isNumeric().not().isEmpty(),
   body('citta').isNumeric().not().isEmpty()
], async (req, res) => {
   const inputValidator = validationResult(req);

   if (!inputValidator.isEmpty()) {
      return res.status(401).render('pages/register', { errors: inputValidator.errors });
   }

   const newUser = await register(
      {
         email: req.body.email,
         password: req.body.password,
         nome: req.body.nome,
         cognome: req.body.cognome,
         data_nascita: req.body.data_nascita,
         tefemminalefono: req.body.telefono,
         residenza_id: req.body.citta,
         sesso_id: req.body.sesso
      })


   if (newUser) {
      const auth = await authenticate(req.body.email, req.body.password)

      req.session.isAuthenticated = true
      req.session.user = await getUser(auth.id)
      expressApp.locals.user = req.session.user
      res.redirect('/');
   } else {
      res.render('pages/register', { errors: [{ msg: "Invalid inputs!", param: "" }] })
   }
})


expressApp.get('/', async (req, res) => {
   res.render('pages/find')
})

expressApp.get('/profile', async (req, res) => {
   res.render('pages/profile', { user: req.session.user })
})
// Proxy route to handle users imgs 
expressApp.get('/users/img/:userID', (req, res) => {
   const files = fs.readdirSync("./public/images/users/")
   let matches = JSON.stringify(files).toString().matchAll(imgFileReg)

   let img = false
   for (let match of matches) {
      img = (match[1] == req.params.userID && !img ? match : img)
   }

   if (img) {
      req.url = `/images/users/${img[1]}.${img[2]}`;
   }
   else
      req.url = `/images/users/default.png`

   expressApp.handle(req, res);
})

// Multer for imgs uploads
expressApp.post('/users/img', (req, res, next) => {
   const files = fs.readdirSync("./public/images/users/")
   let matches = JSON.stringify(files).toString().matchAll(imgFileReg)

   // Unlink all previous images
   for (let match of matches) {
      (match[1] == req.session.user.id) ? fs.unlinkSync(__dirname + `/public/images/users/${match[1]}.${match[2]}`) : null
   }

   res.json({ success: true })
   res.status(200)
   next();
}, uploadImg)


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

expressApp.get('/api/cities', async (req, res) => {
   const cities = await getCities()

   res.contentType('application/json');
   if (cities) {
      res.status = 200
      res.json(cities)
   } else {
      res.status = 400
   }
})

// Aggiorna orientamento
expressApp.post('/api/sesso/orientamento',
   [
      body('sesso_maschio').isEmpty().not(),
      body('sesso_femmina').isEmpty().not()
   ],
   async (req, res, next) => {
      const orientamentoValidator = validationResult(req);

      if (!orientamentoValidator.isEmpty()) {
         res.status = 400
      }

      if (await updateorientamentoSesso(req.session.user.id, { sesso_maschio: req.body.sesso_maschio, sesso_femmina: req.body.sesso_femmina })) {
         req.session.user = await getUser(req.session.user.id)
         expressApp.locals.user = req.session.user
         res.status = 200
      } else {
         res.status = 400
      }
      res.send()
   })

expressApp.get('/api/sesso/orientamento',
   async (req, res) => {
      res.json(await getorientamentoSesso(req.session.user.id))
   })


// Finishing up...
let port = process.argv[2] ? process.argv[2] : 8080
expressApp.listen(port);
console.log(`LISTENING ON PORT ${port}...`);

//https.createServer(
//   { key: fs.readFileSync('./certs/localhost.key', 'utf8'), cert: fs.readFileSync('./certs/localhost.crt', 'utf8'),passphrase:'admin' },
//   expressApp
//).listen(8443)
//console.log(`LISTENING HTTPS ON PORT ${8443}...`);


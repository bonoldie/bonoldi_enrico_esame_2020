// Import modules
const express = require("express")
const expressApp = express();
const session = require("express-session");
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

// setup all the express stuff...
expressApp.use(express.static('public'));
expressApp.use(bodyParser.urlencoded({ extended: true })); 
expressApp.use(session({
   secret: 'myAppSecret',
   resave: false,
   saveUninitialized: true,
   cookie: {
      maxAge: 86400000
   }
}))
expressApp.set('view engine', 'ejs');
expressApp.use(require('./middlewares/auth'));


// Routes
expressApp.get('/login', (req, res) => {
   res.render('pages/login',{errors:[]})
})

expressApp.post('/login', [
   body('email').isEmail(),
   body('password').isLength({ min: 1 })
], (req, res) => {
   const errors = validationResult(req);
   
   if (!errors.isEmpty()) {
      return res.status(401).render('/login',{errors});
   }

   res.render('pages/login')
})

expressApp.get('/', (req, res) => {
   res.render('pages/dashboard')
})


// Finishing up...
expressApp.listen(8080);
console.log("LISTENING ON PORT 8080...");
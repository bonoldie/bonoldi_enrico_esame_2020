const express = require("express");
const session = require("express-session");
const bodyParser = require('body-parser');

// setup all the express stuff...
module.exports = (appInstance) => {
   appInstance.use(express.static('public'));
   appInstance.use(bodyParser.urlencoded({ extended: false }));
   appInstance.use(session({
      secret: 'myAppSecret',
      resave: false,
      saveUninitialized: true,
      cookie: {
         maxAge: 86400000
      }
   }))
   appInstance.set('view engine', 'ejs');
   appInstance.use(require('../middlewares/auth'));
   // For template purpose
   appInstance.locals.user = false
}
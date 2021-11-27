const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');

// initializations
const app = express();
require('./database');
require('./passport/local-auth');

// settings
app.listen(3000);
app.set('views',path.join(__dirname,'views'))
app.use(express.static(__dirname + '/public'));
app.engine('ejs',engine);
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret: "No temo al dolor por que ya nacio a mi lado",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    app.locals.signinMessage = req.flash('signinMessage');
    app.locals.signupMessage = req.flash('signupMessage');
    app.locals.user = req.user;
    console.log(app.locals)
    next();
  });;

app.use('/',require('./routes/index'));



console.log('servidor en el ',3000);
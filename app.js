const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//const User = require('./models/user');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Static Files
app.use(express.static('public'))

// Parsing Middlewares
// Parse application / x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// Parse application / JSON
app.use(bodyParser.json());

// Initialize session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Templating Engine
app.engine('hbs', exphbs.engine({extname: '.hbs'}));
app.set('view engine', 'hbs');

// Connection pool is a cache of database connections maintains so the connection can be reused when future requests to the database are required  
const pool = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_NAME
});

// Connect to mysql database
pool.getConnection((err, connection) => {
  if(err) throw err; // not connected
  console.log('Connected as ID' + connection.threadId);
});

// app.get('', (req, res) => {
//     res.render('home');
// });

const routes = require('./server/routes/user');
app.use('/', routes);

// Initialize Passport.js and session middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Email not found.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Wrong password.' });
    }
    return done(null, user);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Check if the user is logged in and redirect accordingly
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));

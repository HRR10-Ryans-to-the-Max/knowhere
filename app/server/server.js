var bodyParser   = require('body-parser');
var express      = require('express');
var http         = require('http');
var path         = require('path');
var cookieParser = require('cookie-parser');
var passport     = require('passport');
var flash        = require('connect-flash');
var session      = require('express-session');
var morgan       = require('morgan');
var cors         = require('cors');


// Server routers:
var index  = require(path.join(__dirname, 'routes/index'));
var dest   = require(path.join(__dirname, 'routes/dest'));
var group  = require(path.join(__dirname, 'routes/group'));
var fav    = require(path.join(__dirname, 'routes/fav'));
var rating = require(path.join(__dirname, 'routes/rating'));


var app = express();

// Log requests:
app.use(morgan('dev'));

//Client Route
app.use(express.static(path.join(__dirname, '../client')));


// App config:
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded:
app.use(bodyParser.urlencoded({ extended: false }));
// needed for auth
app.use(cookieParser());
// required for passport
app.use(session({secret: 'tripAppIsAmazing', cookie: { maxAge: 3600000}}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
 // pass passport for configuration

// Server routing:
app.use('/api', index);
app.use('/api/dest', dest);
app.use('/api/group', group);
app.use('/api/fav', fav);
app.use('/api/rating', rating);
app.use(cors());

//Authentication Routing
app.post('/login', function (req, res, next) {
  passport.authenticate('local-login',
    function (err, user, info) {
        if (err || !user){
          res.status(200).send({message: info.message});
        } else {
          req.login(user, function (err){
            if (err) {
              console.log(err);
              res.status(500).send({message: err});
            } else {
              res.status(200).send({status: true, user: user});
            }
          });  
        }
    }) (req, res, next);
}); 
 

app.post('/signup', function (req, res, next) {
  passport.authenticate('local-signup',
    function (err, user, info) {
      if (err || !user){
        res.status(200).send({message: info.message});
      } else {
        req.login(user, function (err){
          if (err) {
            console.log(err);
            res.status(500).send({message: err});
          } else {
            res.status(200).send({status: true, user: user});
          }
        });  
      }
    }) (req, res, next);
});

app.get('/logout', function(req, res){
  req.logout();
  res.status(200).send({msg: 'bye'});
});

app.get('/auth/google', passport.authenticate('google', { scope: [  'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read']}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    console.log("shit worked");
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope: ['email']}),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

 app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });
module.exports = app;

// function (req, res, next) {
//   passport.authenticate('local-signup',
//     function (err, user, info) {
//       if (err || !user){
//         res.status(200).send({message: info.message});
//       } else {
//         req.login(user, function (err){
//           if (err) {
//             console.log(err);
//             res.status(500).send({message: err});
//           } else {
//             res.status(200).send({status: true, user: user});
//           }
//         });  
//       }
//     }) (req, res, next);
// });

// process.env.NODE_ENV
// === 'dev'
// 'prod'
// knowhere.herokuapp.com
// https://

//https://www.googleapis.com/auth/userinfo.email
//https://www.googleapis.com/oauth2/v2/userinfo
//knowhere-1157
// client ID
// 1039303204244-ibed3rqe95qds98tkk4gfpja4r4ed6bh.apps.googleusercontent.com
// client secret
//hhdRHgPIL5ezFgwqiKalMNBc
var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash    = require('connect-flash');
var session  = require('express-session');
var morgan = require('morgan');
// Server routers:
var index = require(path.join(__dirname, 'routes/index'));
var dest = require(path.join(__dirname, 'routes/dest'));


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
              res.status(200).send({status: true});
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
            res.status(200).send({status: true});
          }
        });  
      }
    }) (req, res, next);
});

app.get('/logout', function(req, res){
  req.logout();
  res.status(200).send({msg: 'bye'});
});


// Spin up server:
var port = process.env.PORT || '3000';
app.set('port', port);

var server = http.createServer(app);

server.listen(port);
console.log('Server now listening on port ' + port);

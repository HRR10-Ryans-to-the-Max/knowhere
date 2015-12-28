var bodyParser   = require('body-parser');
var express      = require('express');
var http         = require('http');
var path         = require('path');
var cookieParser = require('cookie-parser');
var passport     = require('passport');
var flash        = require('connect-flash');
var session      = require('express-session');
var MongoStore   = require('connect-mongo/es5')(session);
var mongoose     = require('mongoose'); 
var morgan       = require('morgan');
var cors         = require('cors');

var util = require('./util');

// Server routers:
var auth   = require(path.join(__dirname, 'routes/auth'));
var index  = require(path.join(__dirname, 'routes/index'));
var dest   = require(path.join(__dirname, 'routes/dest'));
var group  = require(path.join(__dirname, 'routes/group'));
var rating = require(path.join(__dirname, 'routes/rating'));

// To init state:
var destController = require(path.join(__dirname, './controllers/destController'));


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
app.use(session({
  secret: 'tripAppIsAmazing', 
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 3600000}}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
 // pass passport for configuration

// Server routing:

app.use('/api', index);
app.use('/api/auth', auth);
app.use('/api/dest', dest);
app.use('/api/group', group);
app.use('/api/rating', rating);
app.use(cors());


// INIT STATE
destController.loadDests();


module.exports = app;

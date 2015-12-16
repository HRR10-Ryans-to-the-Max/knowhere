var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

var PROTOCOL_DOMAIN = ( process.env.NODE_ENV === 'production' ?
                        'https://knowhere.herokuapp.com' :
                        'http://localhost:3000' );


// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({    
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback: true
    },
    function(req, username, password, cb) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

      // find a user whose username is the same as the forms username
      // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
              console.log(err);
              cb(err);
            }
          
            // check to see if theres already a user with that email
            // also check to see if they signed up already with facebook or google
            if (user && user.oauth !== true) {
                cb(null, false, {message: "Username already exists"}); 
            } else { 
              if (user.oauth !== true) { 
                // if completely new user
                // create the user
                var newUser         = new User();

                // set the user's local credentials
                newUser.username    = username;
                newUser.password    = newUser.generateHash(password);

                // save the user
                newUser.save(function(err, user) {
                    if (err)
                        throw err;
                    return cb(null, newUser);

                });
              } else { //user has signed up with oauth - just set password
                user.password = user.generateHash(password);
                return cb(null, user);
              }
            }  
        });    
      });
    }));

       // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
              return done(err);

            // if no user is found, return the message
            if (!user)
              return done(null, false, {message: 'No user found'});

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
              return done(null, false, {message: 'Wrong Password'});

            // all is well, return successful user
            return done(null, user);
        });

    }));


  passport.use(new GoogleStrategy({
    clientID: '1039303204244-ibed3rqe95qds98tkk4gfpja4r4ed6bh.apps.googleusercontent.com',
    clientSecret: 'hhdRHgPIL5ezFgwqiKalMNBc',
    callbackURL: PROTOCOL_DOMAIN + '/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {

        
        User.findOne({ 'username' :  profile.emails[0].value }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
              console.log(err);
              cb(err);
            }
                
            // check to see if theres already a user with that email
            if (user) {
                cb(null, user);
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.username    = profile.emails[0].value;
                newUser.oauth       = true;

                // save the user
                newUser.save(function(err, user) {
                    if (err)
                        throw err;
                    return cb(null, newUser);

                });
            }
        });    
      });
    }
  ));

  passport.use(new FacebookStrategy({
    clientID: '323161997808257',
    clientSecret: '3c8a18558adf92b62d696abd5be4fa15',
    callbackURL: PROTOCOL_DOMAIN + '/auth/facebook/callback',
    enableProof: false,
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {

        //TODO they might not have email - if so -login with id
        User.findOne({ 'username' :  profile.emails[0].value }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
              console.log(err);
              cb(err);
            }
                

            // check to see if theres already a user with that email
            if (user) {
                cb(null, user);
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.username    = profile.emails[0].value;
                newUser.oauth       = true;
                

                // save the user
                newUser.save(function(err, user) {
                    if (err)
                        throw err;
                    return cb(null, newUser);

                });
            }
        });    
      });
    }
  ));
};




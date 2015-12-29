var passport     = require('passport');

var util = require('../util');


module.exports = {
  facebookCb: function (req, res, next) {
    res.redirect('/');
  },

  google: function (req, res, next) {
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login',
                'https://www.googleapis.com/auth/plus.profile.emails.read']
    }) (req, res, next);
  },

  googleCb: function (req, res, next) {
    res.redirect('/');
  },

  isLoggedIn: function(req, res, next){
   if (req.isAuthenticated()) {
    res.status(200).send({status: true, user: req.user});
   } else {
    res.status(200).send({status: false});
   }
  },

  login: function (req, res, next) {
      passport.authenticate('local-login', function (err, user, info) {
        if (err || !user) return util.send200(res, { message: info.message });

        req.login(user, function (err){
          if (err) return util.send500(res, { message: err });

          util.send200(res, { status: true, user: user });
        });
      }) (req, res, next);
  },

  logout: function(req, res){
    req.logout();
    res.status(200).send({msg: 'bye'});
  },

  signup: function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
      if (err || !user) return util.send200(res, { message: info.message });

      req.login(user, function (err){
        if (err) return util.send400(res, { message: err });

        res.status(200).send({status: true, user: user});
      });
    }) (req, res, next);
  }
};

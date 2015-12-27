var User   = require('../models/user');
var util = require('../util');
var Venue  = require('../models/venue');
var Group  = require('../models/group');
var Rating = require('../models/rating');


module.exports = {

  getIndex: function(req, res, next) {
    res.render('index');
  },

  isLoggedIn: function(req, res, next){
   if (req.isAuthenticated()) {
    res.status(200).send({status: true, user: req.user});
   } else{
    res.status(200).send({status: false});
   }
  },

  getInfo: function (req, res, next){
    var userId = req.query.userId;

    User.findById(userId, function (err, user){
      if (err) return util.send500(res, err);

      util.send200(res, user);
    });
  }
};

var User   = require('../models/user');
var Venue  = require('../models/venue');
var Group  = require('../models/group');
var Rating = require('../models/Rating');

module.exports = {
  // fill in
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

  getGroups: function (req, res, next){

  },

  getFavs: function (req, res, next){

  },

  getInfo: function (req, res, next){
    var userId = req.params.userId;

    User.findById(userId, function (err, user){
      if (err){
        console.log(err);
        res.status(500).send();
      }

      if (user){
        res.status(200).send(user);
      } else {
        res.status(200).send();
      }
    });
  }
};

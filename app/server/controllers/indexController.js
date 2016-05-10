var User   = require('../models/user');
var Venue  = require('../models/venue');
var Group  = require('../models/group');
var Rating = require('../models/rating');

var path   = require('path');
var util   = require(path.join(__dirname, '../util'));


module.exports = {

  getInfo: function (req, res, next){
    var userId = req.query.userId;

    User.findById(userId, function (err, user){
      if (!user) return util.send400(res, err);

      util.send200(res, user);
    });
  },

  validateUser: function (req, res, next){
    var userId = req.body.id;

    User.findById(userId, function (err, user){
      if (!user) return util.send400(res, err);

      user.validUser = true;

      user.save(function (err, user){
        if (err) return util.send500(res, err);

        res.status(200).send(user);
      });
    });
  }
};

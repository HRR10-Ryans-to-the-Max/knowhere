var User   = require('../models/user');
var util = require('../util');
var Venue  = require('../models/venue');
var Group  = require('../models/group');
var Rating = require('../models/rating');


module.exports = {

  getIndex: function(req, res, next) {
    res.render('index');
  },

  getInfo: function (req, res, next){
    var userId = req.query.userId;

    User.findById(userId, function (err, user){
      if (!user) return util.send400(res, err);
      if (err) return util.send500(res, err);

      util.send200(res, user);
    });
  }
};

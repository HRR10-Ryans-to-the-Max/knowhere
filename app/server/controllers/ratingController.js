var User = require('../models/user');
var Venue = require('../models/venue');
var Group = require('../models/group');
var Rating = require('../models/rating');

module.exports = {

  addRating: function(req, res, next){
    var venueId = req.body.venueId;
    var groupId = req.body.groupId;
    var userId  = req.body.userId;
    var rating  = req.body.rating;

    Rating.findOne({venue: venueId, group: groupId}, function(err, rating){
      if (rating){
        rating.ratings.push({user: userId, rating: rating});
        return res.status(200).send(rating);
      }
      else {
        User.findById(userId, function (err, user){
          if (err){
            console.log(err);
            return res.status(500).send();
          }

          var newRating = new Rating({
            venueId: venueId,
            groupId: groupId,
            rating: {
              user: user,
              rating: rating
            }
          });

          newRating.save(function (err, rating){
            if (err){
              console.log(err);
              return res.status(500).send();
            }
          });

          res.status(200).send(user);

        });
      }
    });
  },

  modifyRating: function(req, res, next){
    var userId   = req.body.userId;
    var ratingId = req.body.ratingId;
    var rating   = req.body.rating;

    Rating.update({_id: ratingId}, {$pull: {user: userId}}, function (err, rating){
      rating.ratings.rating = rating;
      res.status(200).send(rating);
    });

  },

  addUserRating: function (req, res, next){

  },

  modifyUserRating: function (req, res, next){
    
  }
};

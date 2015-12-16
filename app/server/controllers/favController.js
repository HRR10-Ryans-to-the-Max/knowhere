var User = require('../models/user');
var Venue = require('../models/venue');
var Group = require('../models/group');
var Rating = require('../models/rating');
var userRating = require('../models/userRating');


module.exports = {

  addGroupFav: function(req, res, next){ //venueId, group
    var venue = req.body.venue;
    var groupId = req.body.groupId;

    Venue.findById(venueId, function (err, venue){
      if (err){
        console.log(err);
        return res.status(500).send();
      }
      Group.findById(groupId, function (err, group){
        if (err){
          console.log(err);
          return res.status(500).send();
        }
        if (venue){
          group.favorites.push(venue);
          group.save();
          return res.status(200).send(group);
        } else {
          var newVenue = new Venue({
            lookUpId: venue.id,
            name: venue.name,
            venue_type_id: venue.venue_type_id,
            tripexpert_score: venue.tripexpert_score,
            rank: venue.rank_in_destination,
            score: venue.score,
            description: venue.description,
            photo: venue.index_photo
          });

          newVenue.save(function (err, venue){
            if (err){
              console.log(err);
              return res.status(500).send();
            }
          });
           group.favorites.push(venue);
           group.save();

          res.status(200).send(group);
        }
      });
    });
  },

  addUserFav: function(req, res, next) {
    var venue = req.body.venue;
    var userId = req.body.userId;

    Venue.findById(venue._id, function (err, venue){
      if (err){
        console.log(err);
        return res.status(500).send();
      }

      User.findById(userId, function (err, user){
        if (err){
          console.log(err);
          return res.status(500).send();
        }

        if (venue){
          user.favorites.push({venue: venue, rating: 0});
          user.save();
        } else {
          var newVenue = new Venue({
              lookUpId: venue.id,
              name: venue.name,
              venue_type_id: venue.venue_type_id,
              tripexpert_score: venue.tripexpert_score,
              rank: venue.rank_in_destination,
              score: venue.score,
              description: venue.description,
              photo: venue.index_photo
          });

          newVenue.save(function(err, venue){
            if (err){
              console.log(err);
              return res.status(500).send();
            }
          });
          user.favorites.push({venue: venue, rating: 0});
          user.save();
        }
      });
    });
  },

  getGroupFavs: function (req, res, next){
    var groupId = req.params.groupId;

    Group.findById(groupId, function(err, group){
      if (err){
        console.log(err);
        return res.status(500).send();
      }
      // TODO populate and add ratings.
      return res.status(200).send(group.favorites);
    });
  },

  getUserFavs: function (req, res, next){
    var userId = req.params.userId;

    User.findById(userId, function (err, user){
      if (err){
        console.log(err);
        return res.status(500).send();
      }

      if (user){
        return res.status(200).send(user.favorites);
      } else {
        res.status(200).send();
      }
    });
    
  },

  removeGroupFav: function(req, res, next){
    var venueId = req.params.venueId;
    var groupId = req.params.groupId;

    Group.update({_id: groupId}, {$pull : {favorites: venueId}}, function(err, group){
      if (err){
        console.log(err);
      }
      res.status(200).send(group);
    });
    //TODO also remove all ratings for that fav
  },

  removeUserFav: function (req, res, next) {
    var venueId = req.params.venueId;
    var userId = req.params.userId;

    User.update({_id: groupId}, {$pull : {favorites: venueId}}, function(err, user){
      if (err){
        console.log(err);
      }

      res.status(200).send(user);
    });
    //TODO also remove all ratings for that fav
  }
};

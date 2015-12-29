var User   = require('../models/user');
var Venue  = require('../models/venue');
var Group  = require('../models/group');
var Rating = require('../models/rating');
var path   = require('path');
var util   = require(path.join(__dirname, '../util'));


var newVenueWithInfo = function (venueInfo) {
  return new Venue({
    lookUpId: venueInfo.id,
    name: venueInfo.name,
    venue_type_id: venueInfo.venue_type_id,
    tripexpert_score: venueInfo.tripexpert_score,
    rank_in_destination: venueInfo.rank_in_destination,
    score: venueInfo.score, // TODO ? remove Obsolete?
    index_photo: venueInfo.index_photo,
    address: venueInfo.address,
    telephone: venueInfo.telephone,
    website: venueInfo.website,
    photos: venueInfo.photos
  });
};

var sendGroup = function(groupId, res, rating) {
  Group.findById(groupId)
    .populate({
      path: 'favorites',
      populate: { path: 'venue' }
    })
    .exec(function (err, group){
// console.log('######sendGroup0');
      if (err) return util.send500(res, err);

      if (rating) {
        group.favorites.push(rating);
      }
      group.save(function (err, group) {
// console.log('######sendGroup1');
        if (err) return util.send500(res, err);
// console.log('######sendGroup2');
        return util.send200(res, group.favorites);
      });
    });
};

var updateGroupRating = function (paramHash) {
  var groupId = paramHash.groupId;
  var newRating = paramHash.newRating;
  var res = paramHash.res;
  var userId = paramHash.userId;
  var venue = paramHash.venue;


  Rating.update({'allRatings.user': userId, 'groupId': groupId, 'venue': venue._id},
                {$set: {'allRatings.$.userRating': newRating}}, function (err, update){
    if (err) return util.send500(res, err);

    if (update.n > 0) { // Rating exists for that user, and should've been updated.
      return sendGroup(groupId, res, null);
    }
// console.log('########updateGroupRating');

    //user has not already voted, so add to group's ratings
    Rating.findOrCreate({venue: venue._id, venueLU: venue.lookUpId, groupId: groupId}, function (err, rating){
      if (err || !rating) return util.send500(res, err);

      rating.allRatings.push({user: userId, userRating: newRating});
      rating.save(function (err, rating) {
        if (err) return util.send500(res, err);

        return sendGroup(groupId, res, rating);
      });
    });
  });
};

var updateUserRating = function (paramHash) {
  var newRating = paramHash.newRating;
  var res = paramHash.res;
  var userId = paramHash.userId;
  var venue = paramHash.venue;

  User.update({'_id': userId, 'favorites.venueLU': venue.lookUpId},
              {$set : { 'favorites.$.rating': newRating}}, function (err, update) {
    if (err) return util.send500(res, err);
    if (update.n > 0) return; // user vote found, should've been $set updated

    User.findById(userId, function (err, user){
      if (!user) return util.send400(res, err);
      if (err) return util.send500(res, err);

      user.favorites.push({venueLU: venue.lookUpId, venue: venue._id, rating: newRating});
      user.save(function (err, user){
        if (err) return util.send500(res, err);
      });
    });
  });
};


module.exports = {

  addOrUpdateRating: function(req, res, next){  //add to user and group favorites
    var venueInfo = req.body.venue;
    venueInfo.lookUpId = venueInfo.lookUpId || venueInfo.id;
    var groupId = req.body.groupId;
    var userId  = req.body.userId;
    var newRating  = req.body.rating;

    Venue.findOne({lookUpId: venueInfo.lookUpId}, function (err, venue) {
      if (err) return util.send500(res, err);
      
      if (!venue) {
        venue = newVenueWithInfo(venueInfo);
        venue.save(function (err, venue){
          if (err) return util.send500(res, err);
        });
      }

      var argHash = { res: res, // used in #updateUserRating to send errs
                      venue: venue,
                      groupId: groupId, // not used in #updateUserRating
                      userId: userId,
                      newRating: newRating };

      updateUserRating(argHash);

      // User.favorites taken care of, now add to Rating.allRatings (group's ratings)
      // If successful, updateGroupRating() will send the HTTP response
      updateGroupRating(argHash);
    });
  },

  getRatings: function(req, res, next) {
    var groupId = req.query.groupId;

    Group.findById(groupId)
      .populate({  // TODO ? populate Group.members
        path: 'favorites',
        populate: {path: 'venue'}
      })
      .exec(function (err, group){
        if (!group) return util.send400(res, err);
        if (err) return util.send500(res, err);

        util.send200(res, group.favorites);
      });
  },

  getItin: function(req, res, next){
    console.log(req.params);
    console.log(req.query);
    var groupId   = req.query.groupId;
    Group.findById(groupId)
    .populate({
      path: 'favorites',
      populate: { path: 'venue' }
    })
    .exec(function (err, group){
      if (err) return util.send500(res, err);
      if (err) return util.send500(res, err);
      return util.send200(res, group.favorites);
    });

  },

  addItin: function(req, res, next){
    var venueInfo = req.body.venue;
    var groupId   = req.body.groupId;
    var start     = req.body.fromDate;
    var end       = req.body.toDate;


    Rating.update({'groupId': groupId, 'venue': venueInfo.venue},
                  {$set: {'itinerary.startDate': start, 'itinerary.endDate': end}}, function (err, update){

      if (err) return util.send500(res, err);
      if (update.nModified < 0) return util.send400(res, err);
      sendGroup(groupId, res);
    });
  }

  // THE BELOW IS COPY&PASTED FROM FAV CONTROLLER

  // removeGroupFav: function(req, res, next){
  //   var venueId = req.params.venueId;
  //   var groupId = req.params.groupId;

  //   Group.update({_id: groupId}, {$pull : {favorites: venueId}}, function(err, group){
  //     if (err){
  //       console.log(err);
  //     }
  //     res.status(200).send(group);
  //   });
  //   //TODO also remove all ratings for that fav
  // },

  // removeUserFav: function (req, res, next) {
  //   var venueId = req.params.venueId;
  //   var userId = req.params.userId;

  //   User.update({_id: groupId}, {$pull : {favorites: venueId}}, function(err, user){
  //     if (err){
  //       console.log(err);
  //     }

  //     res.status(200).send(user);
  //   });
  //   //TODO also remove all ratings for that fav
  // }
};

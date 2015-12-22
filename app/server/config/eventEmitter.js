var events       = require('events');
var eventEmitter = new events.EventEmitter();
var User         = require('../models/user');
var Venue        = require('../models/venue');
var Rating       = require('../models/rating');
var request      = require('superagent');
var async        = require('async');
var path         = require('path');
var util         = require(path.join(__dirname, '../util'));

// =========================================================================
// Loading User Favs=============================================================
// =========================================================================
// Purpose of this file is to pre-load all the venues currently in the user's
// favorites and all of his group favorites.  This could be many requests so it
// should get started as soon as a user logs in and not wait until the user wishes
// to see it.
 

function getUserFavInfo(userId) {
  User.findById(userId)
  .exec(function (err, user){
    if (!user) return;
    if (err) return;
    (function(){ // the following is done for synchronous purposes
      var index = 0;
      var list = [];
      var noCopies = {};
      var length = user.groupId.length;

      function findRatings(){ //combine user favorites and group into single array
        if (index < length) {
          Rating.findOne({groupId: user.groupId[index]}, function (err, rating){
            if (err) return;
            if (!rating) return;
            if (rating.venueId.name) {
              index++;
              findRatings();
            } else{
              list = [rating.venueId.lookUpId, rating.venueId._id];
              loadVenues();
            }
          });
        }
      }

      findRatings();

      function loadVenues() {
        async.parallel({ // simultaneously get venue info from api and load venue from DB
          getInfo: function(callback) {
            var loadId  = list[0];
              request.get('http://api.tripexpert.com/v1/venues/' + loadId + '?')
              .query({
              api_key: '5d8756782b4f32d2004e811695ced8b6'
              })
              .end(function (err, res) {
                if (err){
                  console.log(err);
                  return;
                }
                var text = JSON.parse(res.text);
                var info = text.response.venue[0];
                callback(null, JSON.parse(res.text).response.venue[0]);
              });
          },

          getVenue: function(callback){
            var venueId = list[1];
            Venue.findOne({lookUpId: venueId} , function (err, venue){
              if (!venue) return;
              if (err) return;
               
               //console.log("venue is ", venue);
               callback(null, venue);
            });
          }
        },
        function (err, results){
          var venue = results.getVenue;
          var info  = results.getInfo;

          venue.venue_type_id = info.venue_type_id;
          venue.name = info.name;
          venue.tripexpert_score = info.tripexpert_score;
          venue.rank_in_destination = info.rank_in_destination;
          venue.address = info.address;
          venue.telephone = info.telephone;
          venue.website = info.website;
          venue.index_photo = info.index_photo;
          venue.photos = info.photos;
          venue.amenities = info.amenities;

          venue.save();

          if (index < length){
            index++;
            findRatings();
          }
        });
      }
    });//();
  });
}

function cleanUp() {
  //TODO make sure references are being deleted
}

eventEmitter.addListener('getFavInfo', getUserFavInfo);

module.exports = eventEmitter;


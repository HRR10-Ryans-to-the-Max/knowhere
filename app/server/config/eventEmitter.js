// FIXME getUserFavInfo() never invoked any of its helper functions.


// var async        = require('async');
// var events       = require('events');
// var eventEmitter = new events.EventEmitter();
// var path         = require('path');
// var request      = require('superagent');

// var Rating       = require('../models/rating');
// var User         = require('../models/user');
// var util         = require(path.join(__dirname, '../util'));
// var Venue        = require('../models/venue');

// // =========================================================================
// // Loading User Favs=============================================================
// // =========================================================================
// // Purpose of this file is to pre-load all the venues currently in the user's
// // favorites and all of his group favorites.  This could be many requests so it
// // should get started as soon as a user logs in and not wait until the user wishes
// // to see it.

// function getUserFavInfo(userId) {
//   User.findById(userId)
//   .exec(function (err, user){
//     if (!user || err) return;

//     // this immediately-invoked function expression is done for synchronous purposes
//     (function(){
//       var index = 0;
//       var list = [];
//       var noCopies = { };
//       var numGroups = user.groupIds.length;

//       function findRatings(){ //combine user favorites and group into single array
//         if (index < numGroups) {
//           Rating.findOne({groupId: user.groupIds[index]}, function (err, rating){
//             if (err || !rating) return;

//             if (rating.venueId.name) {
//               index += 1;
//               findRatings();
//             } else {
//               list = [rating.venueId.lookUpId, rating.venueId._id];
//               loadVenues();
//             }
//           });
//         }
//       }

//       function loadVenues(){
//         async.parallel({ // simultaneously get venue info from api and load venue from DB
//           getInfo: function(callback) {
//             var loadId  = list[0];
//               request.get('http://api.tripexpert.com/v1/venues/' + loadId + '?')
//               .query({
//                 api_key: process.env.TRIPEXPERT_KEY
//               })
//               .end(function (err, res) {
//                 if (err) return console.error(err);
//                 var text = JSON.parse(res.text);
//                 var info = text.response.venue[0];

//                 callback(null, JSON.parse(res.text).response.venue[0]);
//               });
//           },

//           getVenue: function(callback){
//             var venueId = list[1];
//             Venue.findOne({lookUpId: venueId} , function (err, venue){
//               if (!venue || err) return;

//               callback(null, venue);
//             });
//           }
//         },
//         function (err, results){
//           if (err || !results) return console.error(err);
//           var venue = results.getVenue;
//           var info  = results.getInfo;

//           venue.venue_type_id = info.venue_type_id;
//           venue.name = info.name;
//           venue.tripexpert_score = info.tripexpert_score;
//           venue.rank_in_destination = info.rank_in_destination;
//           venue.address = info.address;
//           venue.telephone = info.telephone;
//           venue.website = info.website;
//           venue.index_photo = info.index_photo;
//           venue.photos = info.photos;
//           venue.amenities = info.amenities;

//           venue.save();

//           // FIXME length is undefined
//           // if (index < length){
//           //   index++;
//           //   findRatings();
//           // }
//         });
//       }
//     })();
//   });
// }

// // function cleanUp() {
// //   //TODO make sure references are being deleted
// // }

// eventEmitter.addListener('getFavInfo', getUserFavInfo);

// module.exports = eventEmitter;


var request = require('superagent');
var Dest    = require('../models/destination');

var Venue = require('../models/venue');
var User = require('../models/user');
var Group = require('../models/group');

var util = require('../util');
var venues = require("../../../mock-data/venues.json");
var dests = require("../../../mock-data/destinations.json");

var venue = venues.Results;
var oldDest = dests.Results;

function loadDests(){

  function StupidJSHint(err, dest){
    if (err) console.log(err);
  }

    request.get('http://api.tripexpert.com/v1/destinations?api_key=' + process.env.TRIPEXPERT_KEY)
       .end(function (err, res) {
          if (err){
            console.log(err);
            return;
          }
          var text = JSON.parse(res.text);
          list = text.response.destinations;
          for (var i = 0; i < list.length; i++){
            Dest.findOrCreate({id: list[i].id}, {perm: list[i].permalink, destId: list[i].id}, StupidJSHint);
          }
       });
}

 loadDests();


module.exports = {

  getDestinations: function (req, res, next) {
    var url = 'http://api.tripexpert.com/v1/destinations?';
    var limit = req.query.limit;
    request.get(url)
      .query({
        limit: limit,
        api_key: '5d8756782b4f32d2004e811695ced8b6'
      })
      .end(function (err, response) {
        if (err) {
          return util.send500(res, err);
        }
        return res.status(200).send(response.body);
      });
  },

  getVenues: function (req, res, next){
    var destinationId = req.query.destinationId;
    request.get('http://api.tripexpert.com/v1/venues?')
         .query({
          destination_id: destinationId,
          api_key: process.env.TRIPEXPERT_KEY
        })
         .end(function (err, response) {
            if (err){
              console.log(err);
              return res.status(500).send();
            }
            var text = JSON.parse(response.text);
            return res.status(200).send(text.response.venues);
         });
  },

  getDetailedInfo: function (req, res, next){
    var venueId = req.query.venueId;
    var url = 'http://api.tripexpert.com/v1/venues/' + venueId;

    request.get(url)
        .query({
          api_key: process.env.TRIPEXPERT_KEY
        })
        .end(function (err, response) {
          if (err) return util.send500(res, err);

          return res.status(200).send(response.body.response.venue[0]);
        });
  }
};

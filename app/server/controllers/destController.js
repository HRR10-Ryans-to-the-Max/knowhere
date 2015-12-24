var request = require('superagent');
var Dest    = require('../models/destination');

var Venue = require('../models/venue');
var User = require('../models/user');
var Group = require('../models/group');

var util = require('../util');
var venues = require("../../../mock-data/venues.json");
var dests = require("../../../mock-data/destinations.json");


module.exports = {

  getDestinations: function (req, res, next) {
    var url = 'http://api.tripexpert.com/v1/destinations';
    var limit = req.query.limit;

    request.get(url)
      .query({
        limit: limit,
        api_key: process.env.TRIPEXPERT_KEY,
      })
      .end(function (err, response) {
        if (err) return util.send500(res, err);

        /* @response {object} has:
            @prop {object} meta. Has:
              @prop {int} code.  HTTP response code.
            @prop {object} response. Is the object of interest, having:
              @prop {int} total_records. Number of destinations on TripExpert.
              @prop {array} destinations. The destination objects.
        */
        return res.status(200).send(response.body.response);
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
        if (err) return util.send500(res, err);

        /* @response {object} has:
            @prop {object} meta. Has:
              @prop {int} code.  HTTP response code.
            @prop {object} response.  Is the object of interest, having:
              @prop {array} venues.  The venue objects.
        */
        return res.status(200).send(response.body.response.venues);
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
  },

  loadDests: function () {

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
};

var db = require('../../../db/db.js');
var mongoose = require('mongoose');


var Venue = mongoose.model('Venue', db.venueSchema);

module.exports = Venue;
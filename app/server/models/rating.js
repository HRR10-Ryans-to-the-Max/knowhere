var db = require('../../../db/db.js');
var mongoose = require('mongoose');

var Rating = mongoose.model('Rating', db.ratingSchema);

module.exports = Rating;
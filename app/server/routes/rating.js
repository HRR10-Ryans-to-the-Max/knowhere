var express = require('express');
var router = express.Router();

var ratingController = require('../controllers/ratingController');

router.get('/', ratingController.getRatings);

router.post('/', ratingController.addOrUpdateRating);

router.post('/itin', ratingController.addItin);


module.exports = router;

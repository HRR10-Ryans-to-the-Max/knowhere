var express = require('express');
var router = express.Router();

var ratingController = require('../controllers/ratingController');

router.get('/', ratingController.getRatings);

router.post('/', ratingController.addOrUpdateRating);

router.delete('/', ratingController.removeUserRatingFromGroup);

router.get('/itin', ratingController.getItin);

router.post('/itin', ratingController.addItin);

router.delete('/itin', ratingController.removeItin);


module.exports = router;

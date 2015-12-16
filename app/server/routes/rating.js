var express = require('express');
var router = express.Router();

var ratingController = require('../controllers/ratingController');

router.post('/', ratingController.addRating);

router.post('/mod', ratingController.modifyRating);

router.post('/user', ratingController.addUserRating);

router.post('/usermod', ratingController.modifyUserRating);
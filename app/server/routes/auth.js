var express = require('express');
var passport     = require('passport');
var router = express.Router();

var authController = require('../controllers/authController');
var util = require('../util');


router.get('/check', authController.isLoggedIn);

router.post('/login', authController.login);

router.post('/signup', authController.signup);

router.get('/logout', authController.logout);

router.get('/google', authController.google);

router.get('/google/callback',
     // authenticate before calling authController
     passport.authenticate('google', { failureRedirect: '/' }),
     authController.googleCb);

router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email']}),
    function (req, res, next) {
      // The request will be redirected to Facebook for authentication
      // so this function will not be called.
    });

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    authController.facebookCb);


 module.exports = router;

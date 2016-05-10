var express = require('express');
var path = require('path');

var indexController = require(path.join(__dirname, '../controllers/indexController'));


var router = express.Router();

router.get('/info', indexController.getInfo);

router.post('/validate', indexController.validateUser);


module.exports = router;

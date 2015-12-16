var express = require('express');
var path = require('path');

var indexController = require(path.join(__dirname, '../controllers/indexController'));


var router = express.Router();

/* GET home page. */
router.get('/', indexController.getIndex);

router.get('/check', indexController.isLoggedIn);

router.get('/info', indexController.getInfo);

router.get('/groups', indexController.getGroups);

router.get('/favs', indexController.getFavs);

// User sign up
// curl -H "Content-Type: application/json" -X POST -d '{"username":"testuser", "password":"testpass", "teamname":"my team"}' http://localhost:3000/api/signup
//router.post('/signup', indexController.createUser);

// User log in
// Returns 401 for not authorized and 'Password does not match' 'Username does not exist' and 'Team does not exist'
// Returns 200 and true for authorized
// curl -H "Content-Type: application/json" -X POST -d '{"username":"testuser", "password":"testpass", "teamname":"my team"}' http://localhost:3000/api/login
//router.post('/login', indexController.loginUser);


module.exports = router;

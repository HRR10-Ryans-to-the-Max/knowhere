var express = require('express');
var router = express.Router();

var groupController = require('../controllers/groupController');

router.get('/', groupController.getUserGroups);

router.get('/users', groupController.getAllMembers);

router.get('/fav', groupController.getAllFavs);

router.get('/all', groupController.getAllInfo);

router.post('/', groupController.createGroup);

router.post('/set', groupController.setDest);

router.post('/add', groupController.addMember);

router.delete('/user', groupController.removeMember);


module.exports = router;
var path = require('path');
var User   = require('../models/user');
var Venue  = require('../models/venue');
var Group  = require('../models/group');
var Rating = require('../models/rating');
var mongoose = require('mongoose');

var util = require(path.join(__dirname, '../util'));

// Mock Data Load
var venues = require("../../../mock-data/venues.json");
var venue  = venues.Results;

module.exports = {

  createGroup: function(req, res, next){
    var title  = req.body.groupName;
    var destId   = req.body.destinationId;
    var userId = req.body.userId;

    User.findById(userId)
      .populate('groupIds')
      .exec(function (err, user) {
        if (!user) return res.status(400).send();
        if (err) return res.status(500).send();

        for (var i = 0; i < user.groupIds.length; i++){
          if (user.groupIds[i].title === title){
            return res.status(200).send(user.groupIds[i]);
          }
        }

        var newGroup = new Group({
          title: title,
          destination: destId,
          host: user
        });
        newGroup.members.push(user._id);
        newGroup.save(function (err, group){
          if (!group) return util.send400(res, err);
          if (err) return util.send500(res, err);

          user.groupIds.push(group._id);
          user.save(function (err, user){
            if (!user) return util.send400(res, err);
            if (err) return util.send500(res, err);

            res.status(200).send(group);
          });
        });
      });
  },

  // getGroupByTitle: function(req, res, next){ // FIXME account for two groups with same name but with different hosts
    // title is undefined
  //   Group.findOne({title: title}, function (err, group){
  //     if (err){
  //       console.log(err);
  //       return res.status(500).send();
  //     }
  //     res.status(200).send(group);
  //   });
  // },

  // Not currently implemented on the front-end
  setDestination: function(req, res, next){
    var dest    = req.body.destination;
    var groupId = req.body.groupId;

    Group.findById(groupId, function (err, group){
      if (!group) return util.send400(res, err);
      if (err) return util.send500(res, err);

      group.destination = dest;
      group.save(function (err, group) {
        if (!group) return util.send400(res, err);
        if (err) return util.send500(res, err);

        res.status(200).send(group);
      });
    });
  },

  addMember: function(req, res, next){ //username, groupId
    var groupId = req.body.groupId;
    var username = req.body.username;

    User.findOne({ username: username }, function (err, user){
      if (!user) return util.send400(res, err);
      if (err) return util.send500(res, err);

      Group.findById(groupId, function (err, group){
        if (!group) return util.send400(res, err);
        if (err) return util.send500(res, err);

        var userInGroup = group.members.some(function (member) {
          // Mongoose ObjectId comparisons are funky.
          // Read more: http://stackoverflow.com/questions/11060213/mongoose-objectid-comparisons-fail-inconsistently
          return member._id.equals(user._id);
        });

        if (userInGroup){
          return res.status(409).send(group);
        }

        user.groupIds.push(group);
        user.save(function (err, user) {
          if (err) return util.send400(res, err);

          group.members.push(user);
          group.save(function (err, group) {
            if (err) return util.send400(res, err);

            return res.status(200).send(group);
          });
        });
      });
    });
  },

  removeMember: function(req, res, next){ // delete api/group/user
    var userId = req.body.userId;
    var groupId = req.body.groupId;

    Group.update({ _id: groupId }, { $pull: { members: userId } }, function (err, groupOut){
      if (err) return util.send500(res, err);

      User.update({ _id: userId }, { $pull: { groupIds: groupId } }, function (err, userOut) {
        if (err) return util.send500(res, err);

        res.status(200).send(groupOut);
      });
    });
    //TODO: also remove user ratings
  },

  getUserGroups: function (req, res, next){
    var userId = req.query.userId;

    User.findById(userId, function (err, user){
      if (err){
        console.log(err);
        res.status(500).send();
      }

      if (user){
        res.status(200).send(user.groupIds);
      } else {
        res.status(200).send();
      }
    });
  },

  getMembers: function(req, res, next){
    var groupId = req.query.groupId;

    Group.findById(groupId)
        .populate('members')
        .exec(function (err, group){
          if (!group) return util.send400(res, err);
          if (err) return util.send500(res, err);

          return res.status(200).send(group.members);
        });
  },

  // TODO ? Return { groupFavs: { }, userFavs: { }} ?
  // THIS SHOULD BE MADE OBSOLETE BY favController.getFavs
  // getFavorites: function (req, res, next){
  //   var groupId = req.query.groupId;
  //   var userId  = req.query.userId;

  //   Group.findById(groupId, function(err, group){
  //     if (!group) return util.send400(res, err);
  //     if (err) return util.send500(res, err);

  //     // TODO populate and add ratings.
  //     return res.status(200).send(group.favorites);
  //   });
  // },


  getGroups: function (req, res, next){
    var userId = req.query.userId;

    User.findById(userId, function (err, user){
      if (err){
        console.log(err);
        res.status(500).send();
      }

      if (user){
        res.status(200).send(user.groupIds);
      } else {
        res.status(200).send();
      }
    });
  },

  getInfo: function(req, res, next){
    var groupId = req.query.groupId;

    Group.findById(groupId)
        .populate('favorites')
        .populate('members')
        .lean() // lean() makes it return plain JS object
        .exec(function (err, group){

          // populate favorites' ratings
          (function(){ // the following is done for synchronous purposes
            var index = 0;

            function assignRatings(){
              if (index >= group.favorites.length){
                return res.status(200).send(group);
              }

              var venueId = group.favorites[index]._id;

              Rating.findOne({ venue: venueId, group: group._id }, function (err, rating){
                if (rating) {
                  group.favorites[index].ratings = rating.ratings;
                }
                index++;
                assignRatings();
              });
            }
            assignRatings();
          })();
        });
  }
};

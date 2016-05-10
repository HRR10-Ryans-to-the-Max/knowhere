var _ = require('underscore');
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

sendGroupInfo = function (res, groupId){
  Group.findById(groupId)
  .populate({
    path: 'members',
    select: 'username firstName lastName'
  })
  .populate({
    path: 'hosts',
    select: 'username firstName lastName'
  })
  .populate({
    path: 'favorites',
    select: 'venue',
    populate: {path: 'venue', select: 'name index_photo', model: 'Venue'}
  })
  .exec(function (err, group){
    if (!group) return util.send400(res, err);
    if (err) return util.send500(res, err);

    return util.send200(res, group);
  });
};

module.exports = {

  createGroup: function(req, res, next){
    var title    = req.body.groupName;
    var destId   = req.body.destinationId;
    var destName = req.body.destinationName;
    var userId   = req.body.userId;

    User.findById(userId)
      .populate('groupIds')
      .exec(function (err, user) {
        if (!user) return util.send400(res, err);
        if (err) return util.send500(res, err);

        var oldGroup = _.find(user.groupIds, function (groupId) {
          return groupId.title === title;
        });

        if (oldGroup) {
          return sendGroupInfo(res, oldGroup);
        }

        var newGroup = new Group({
          title: title,
          destination: destId,
        });
        newGroup.hosts.push(user._id);
        newGroup.members.push(user._id);
        newGroup.save(function (err, group){
          if (err) return util.send500(res, err);

          user.groupIds.push(group._id);
          user.save(function (err, user){
            if (err) return util.send500(res, err);

            sendGroupInfo(res, group);
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

      Group.findById(groupId)
        .populate({ path: 'members' })
        .exec(function (err, group) {
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
    var userId = req.query.userId;
    var groupId = req.query.groupId;

    Rating.update({'allRatings.user': userId, groupId: groupId},
                  {$pull: {allRatings: { user: userId}}}, function (err, ratingUpdate){
      if (err) return util.send500(res, err);

      Group.update({ _id: groupId }, { $pull: { hosts: userId, members: userId } }, function (err, groupUpdate){
        if (err) return util.send500(res, err);

        User.update({ _id: userId }, { $pull: { groupIds: groupId } }, function (err, userUpdate) {
          if (err) return util.send500(res, err);

          res.sendStatus(204);
        });
      });
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

    User.findOne({_id: userId})
      .populate({
        path: 'groupIds',
        populate: {path: 'favorites', select: 'venue', model: 'Rating',
                  populate: {path: 'venue', select: 'name index_photo', model: 'Venue'}},
      })
      .exec(function (err, person){
        User.populate(
          person,
          {path: 'groupIds.members ', select: 'username firstName lastName', model: 'User'}, function (err, person) {
          User.populate(
            person,
            {path: 'groupIds.hosts', select: 'username firstName lastName', model: 'User'}, function (err, person){

            var data = ( person ? person.groupIds : null );


            util.send200(res, data);
          });
        });
      });
  },

  getInfo: function(req, res, next){
    var groupId = req.query.groupId;

    Group.findById(groupId)
        .populate('members')
        .populate({
          path: 'favorites',
          populate: {path: 'venue'}
        })
        .exec(function (err, group){
          if (!group) return util.send400(res, err);
          if (err) return util.send500(res, err);

          util.send200(res, group);
        });
  }
};

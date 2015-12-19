process.env.NODE_ENV = 'test';

var _ = require('underscore');
var assert = require('chai').expect;
var expect = require('chai').expect;
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

var db = require(path.join(__dirname, '../../db/db'));
var Group = require(path.join(__dirname, '../../app/server/models/group'));
var groupController = require(path.join(__dirname,
                              '../../app/server/controllers/groupController'));
var server = require(path.join(__dirname, '../../app/server/server'));
var testUtil = require(path.join(__dirname, '../testUtil'));
var User = require(path.join(__dirname, '../../app/server/models/user'));


describe('groupController', function () {

  var group, testGroupDestination, testGroupDestination2, testGroupName,
      testUser, testUser2;

  before(function (done) {
    request = request(server);
    testGroupDestination = 'new-york-city';
    testGroupDestination2 = 'portland';
    testGroupName = 'test group';

    // TODO Refactor how how con is set?
    con = mongoose.createConnection('mongodb://localhost/tripapptest');
    // con = mongoose.connection;

    // TODO Refactor to use promise
    setTimeout(function () {
      testUtil.dropDb(con, done);
    }, 100); // on @ZacharyRSmith's machine, connection needs ~15ms to set up
  });

  beforeEach(function (done) {
    testUtil.dropDb(con, function () {

      User.create({ username: 'test user' }, function (err, user) {
        if (err || !user) console.error(err);

        testUser = user;

        User.create({ username: 'test user 2'}, function (err, user2) {
          if (err || !user2) console.error(err);

          testUser2 = user2;

          request
            .post('/api/group')
            .send({
              groupName: testGroupName,
              destination: testGroupDestination,
              userInfo: testUser._id,
            })
            .end(function (err, res) {
              group = JSON.parse(res.text);
              done();
            });
          // done();
        });
      });
    });
  });

  after(function (done) {
    testUtil.dropDb(con, function () {
      con.close(done);
    });
  });

  afterEach(function (done) {
    testUtil.dropDb(con, done);
  });

  describe('addMember()', function () {

    it('does not re-add user to group and vice versa if already in group', function (done) {
      request
        .post('/api/group/add')
        .send({
          groupId: group._id,
          username: testUser.username
        })
        .end(function (err, res) {
          var updatedGroup = JSON.parse(res.text);

          expect(updatedGroup.members.length).to.equal(1);
          done();
        });
    });

    it('adds user to group and vice versa if not already in group', function (done) {
      request
        .post('/api/group/add')
        .send({
          groupId: group._id,
          username: testUser2.username
        })
        .end(function (err, res) {
          var updatedGroup = JSON.parse(res.text);

          expect(updatedGroup.members.length).to.equal(2);
          done();
        });
    });
  });

  describe('createGroup()', function () {

    it('should not create when provided with invalid userId', function (done) {
      request
        .post('/api/group')
        .send({
          groupName: testGroupName,
          destination: testGroupDestination,
          userInfo: 'fakeUserId',
        })
        .expect(400, done);
    });

    it('should not create if no group destination is provided', function (done) {
      request
        .post('/api/group')
        .send({
          groupName: testGroupName,
          destination: '            ',
          userInfo: testUser._id,
        })
        .end(function (err, res) {
          expect(res.ok).to.be.false;
          done();
        });
    });

    it('should not create if no group title is provided', function (done) {
      request
        .post('/api/group')
        .send({
          groupName: '          ',
          destination: testGroupDestination,
          userInfo: testUser._id,
        })
        .end(function (err, res) {
          expect(res.ok).to.be.false;
          done();
        });
    });

    it('should set provided userId as group host', function () {
      expect(group.host._id).to.equal(testUser._id + '');
    });

    it('should set title and destination', function () {
      expect(group.title).to.equal(testGroupName);
      expect(group.destination).to.equal(testGroupDestination);
    });

    it('should add group\'s host to group.members', function () {
      expect(_.contains(group.members, testUser._id + ''));
    });

    it('should add the new group to the host\'s groupId', function (done) {
      // Update testUser
      User.findOne({ _id: testUser._id }, function (err, user) {
        expect(_.contains(user.groupId, group._id));
        done();
      });
    });
  });

  describe('getMembers()', function () {

    beforeEach(function (done) {

      request
        .post('/api/group/add')
        .send({
          groupId: group._id,
          username: testUser2.username
        })
        .end(function (err, res) {
          var group = JSON.parse(res.text);
          done();
        });
    });

    it('returns members as JSON', function (done) {

      request
        .get('/api/group/users')
        .send({
          groupId: group._id,
        })
        .end(function (err, res) {
          var members = JSON.parse(res.text);
          var membersIds = members.map(function (member) {
            return member._id + '';
          });

          expect(membersIds.length).to.equal(2);
          expect(_.contains(membersIds, testUser._id + ''));
          expect(_.contains(membersIds, testUser2._id + ''));
          done();
        });
    });
  });

  describe('removeMember()', function () {

    beforeEach(function (done) {

      request
        .del('/api/group/user')
        .send({
          groupId: group._id,
          userId: testUser._id
        })
        .expect(200)
        .end(function (err, res) {

          // Update group
          Group.findById(group._id, function (err, _group_) {
            group = _group_;
            done();
          });
        });
    });

    it('removes user from group.members', function (done) {
      expect(group.members.length).to.equal(0);
      done();
    });

    it('removes group from user.groupId', function (done) {
      User.findById(testUser._id, function (err, user) {
        var userHasGroup = user.groupId.some(function (id) {
          return id.equals(group._id);
        });

        expect(userHasGroup).to.equal(false);
        done();
      });
    });
  });

  describe('setDestination()', function () {

    it('changes group\'s destination and returns updated group', function (done) {

      request
        .post('/api/group/set')
        .send({
          destination: testGroupDestination2,
          groupId: group._id,
        })
        .expect(200)
        .end(function (err, res) {
          if (err) console.error(err);

          var actualDestination = JSON.parse(res.text).destination;

          expect(actualDestination).to.equal(testGroupDestination2);
          done();
        });
    });
  });
});

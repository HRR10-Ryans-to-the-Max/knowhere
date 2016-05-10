process.env.NODE_ENV = 'test';

var _ = require('underscore');
var assert = require('chai').expect;
var expect = require('chai').expect;
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

var db = require(path.join(__dirname, '../../db/db'));
var server = require(path.join(__dirname, '../../app/server/server'));
var testUtil = require(path.join(__dirname, '../testUtil'));
// Models
var Group = require(path.join(__dirname, '../../app/server/models/group'));
var Rating = require(path.join(__dirname, '../../app/server/models/rating'));
var User = require(path.join(__dirname, '../../app/server/models/user'));
var Venue = require(path.join(__dirname, '../../app/server/models/venue'));


describe('server controllers', function () {
  var newHotelInfo, greenwichHotel, greenwichHotelInfo, group, testGroupDestination,
      testGroupDestination2, testGroupName,
      testUser, testUser2;

  before(function (done) {
    // TravisCI has been timing out at the default 2000
    this.timeout(5000);

    newHotelInfo = {
      "id": "2",
      "venue_type_id": 1,
      "name": "Crosby Street Hotel",
      "tripexpert_score": 98,
      "rank_in_destination": 2,
      "score": 98,
      "description": "Opened in SoHo in 2009, this Kit Kemp–designed 11-story brownstone has floor-to-ceiling windows throughout and is environmentally certified as an LEED Gold property.",
      "index_photo": "http://static.tripexpert.com/images/venues/index_photos/index_retina/636532.jpg"
    };
    greenwichHotelInfo = {
      "id": "1",
      "venue_type_id": 1,
      "name": "Greenwich Hotel",
      "tripexpert_score": 99,
      "rank_in_destination": 1,
      "score": 99,
      "description": "Robert DeNiro and partners spared nothing in their luxurious eight-story hotel, which opened in 2008.",
      "index_photo": "http://static.tripexpert.com/images/venues/index_photos/index_retina/637972.jpg"
    };
    request = request(server);
    nycId = 6;
    testGroupDestination2 = 'portland';
    testGroupName = 'test group';

    // TODO Refactor how how con is set?
    con = mongoose.createConnection('mongodb://localhost/tripapptest');
    // con = mongoose.connection;

    // TODO Refactor to use promise
    setTimeout(function () {
      testUtil.dropDb(con, done);
    }, 1000); // on @ZacharyRSmith's machine, connection needs ~15ms to set up
  });

  beforeEach(function (done) {
    testUtil.dropDb(con, function () {

      User.create({ username: 'test user' }, function (err, user) {
        if (err) console.error(err);

        testUser = user;

        User.create({ username: 'test user 2'}, function (err, user2) {
          if (err) console.error(err);

          testUser2 = user2;

          Venue.create({
            lookUpId: greenwichHotelInfo.id,
            name: greenwichHotelInfo.name,
            venue_type_id: greenwichHotelInfo.venue_type_id,
            tripexpert_score: greenwichHotelInfo.tripexpert_score,
            rank: greenwichHotelInfo.rank_in_destination,
            score: greenwichHotelInfo.score,
            description: greenwichHotelInfo.description,
            photo: greenwichHotelInfo.index_photo
          }, function (err, greenwichHotel) {
            if (err) console.error(err);

            greenwichHotel = greenwichHotel;

            // create test group
            request
              .post('/api/group')
              .send({
                groupName: testGroupName,
                destId: nycId,
                userId: testUser._id,
              })
              .end(function (err, res) {
                group = res.body;

                // create test rating
                request
                  .post('/api/rating/')
                  .send({
                    venue: greenwichHotel,
                    groupId: group._id,
                    userId: testUser._id,
                    rating: 5
                  })
                  .end(function (err, res) {
                    if (err) console.error(err);
                    done();
                  });
            });
          });
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

  // Leave pending so no calls are made to TripExpert's API
  xdescribe('destController', function () {

    describe('getDestinations()', function () {

      it('defaults to returning 100 destinations', function (done) {
        request
          .get('/api/dest/')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);

            expect(res.body.destinations.length).to.equal(100);
            done();
          });
      });

      it('can get moar destinations', function (done) {
        request
          .get('/api/dest/')
          .query({ limit: 200 })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);

            expect(res.body.destinations.length).to.equal(200);
            done();
          });
      });
    });
  });

  describe('groupController', function () {

    describe('addMember()', function () {

      it('does not re-add user to group and vice versa if already in group', function (done) {
        request
          .post('/api/group/add')
          .send({
            groupId: group._id,
            username: testUser.username
          })
          .end(function (err, res) {
            var updatedGroup = res.body;

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
            var updatedGroup = res.body;

            expect(updatedGroup.members.length).to.equal(2);
            done();
          });
      });
    });

    describe('createGroup()', function () {

      it('should err when provided with invalid userId', function (done) {
        request
          .post('/api/group')
          .send({
            groupName: 'new group name',
            destination: 'new group destination',
            userInfo: 'fakeUserId',
          })
          .expect(400, done);
      });

      it('should not create if no group destination is provided', function (done) {
        request
          .post('/api/group')
          .send({
            groupName: 'new group name',
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

      it('should set provided userId as a group host', function () {
        var hosts = group.hosts.map(function (host) {
          return host._id + '';
        });

        expect(_.contains(hosts, testUser._id + ''));
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
          expect(_.contains(user.groupIds, group._id));
          done();
        });
      });
    });

    describe('getInfo()', function () {

      beforeEach(function (done) {
        request
          .get('/api/group/all?groupId=' + group._id)
          .end(function (err, res) {
            group = res.body;
            done();
          });
      });

      it('returns a plain JS object', function () {
        expect(group.constructor).to.equal(Object);
      });

      // Need test favorites to check this
      xit('populates favorites', function () {
        expect(group.favorites[0].constructor).to.equal(Object);
      });

      // Need test favorites to check this
      xit('populates favorite\'s ratings', function () {
        // body...
      });

      it('populates members', function () {
        expect(group.members[0].constructor).to.equal(Object);
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
            group = res.body;
            done();
          });
      });

      it('returns members as JSON', function (done) {

        request
          .get('/api/group/users?groupId=' + group._id)
          .end(function (err, res) {
            var membersIds = res.body.map(function (member) {
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
        // create rating
        request
          .post('/api/rating')
          .send({
            venue: greenwichHotelInfo,
            groupId: group._id,
            userId: testUser._id,
            rating: 5
          })
          .end(function (err, res) {
            // remove member
            request
              .del('/api/group/user')
              .query({
                groupId: group._id,
                userId: testUser._id + '' // Cast BSON to str
              })
              .expect(200)
              .end(function (err, res) {

                // Update var group
                Group.findById(group._id, function (err, _group_) {
                  group = _group_;
                  done();
                });
              });
          });
      });

      it('removes user from group.members', function (done) {
        expect(group.members.length).to.equal(0);
        done();
      });

      it('removes user from group.hosts', function (done) {
        expect(group.hosts.length).to.equal(0);
        done();
      });

      it('removes group from user.groupIds', function (done) {
        User.findById(testUser._id, function (err, user) {
          var userHasGroup = user.groupIds.some(function (id) {
            return id.equals(group._id);
          });

          expect(userHasGroup).to.equal(false);
          done();
        });
      });

      it('removes user\'s ratings from group\'s ratings', function (done) {
        Rating.findOne({ 'groupId': group._id }, function (err, rating) {
          expect(rating.allRatings.length).to.equal(0);
          done();
        });
      });
    });

    describe('setDestination()', function () {

      it('changes group\'s destination and returns updated group', function (done) {
        var parisId = 5;

        request
          .post('/api/group/set')
          .send({
            destination: parisId,
            groupId: group._id,
          })
          .expect(200)
          .end(function (err, res) {
            if (err) console.error(err);

            var actualDestination = res.body.destination;

            expect(actualDestination).to.equal(parisId);
            done();
          });
      });
    });
  });

  describe('indexController', function () {

    it('getInfo() returns user info', function (done) {
      request
        .get('/api/info')
        .query({
          userId: testUser._id + '' // cast BSON to str
        })
        .end(function (err, res) {
          expect(res.body.username).to.equal(testUser.username);
          done();
        });
    });

    it('validateUser() should return code 400 when user does not exist', function (done) {
      request
        .post('/api/validate')
        .send({
          id: -1
        })
        .end(function (err, res) {
          expect(res.statusCode).to.equal(400);
          done();
        });
    });

    it('validateUser() should return user when user exists', function (done) {
      request
        .post('/api/validate')
        .send({
          id: testUser.id
        })
        .end(function (err, res) {
          expect(res.statusCode).to.equal(200);
          expect(res.body.username).to.equal(testUser.username);
          done();
        });
    });
  });

  describe('ratingController', function () {

    describe('addOrUpdateRating()', function () {

      it('adds venue to user.favorites', function (done) {
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: greenwichHotelInfo,
          })
          .end(function (err, res) {
            User.findById(testUser._id, function (err, user) {
              expect(user.favorites.length).to.equal(1);
              done();
            });
          });
      });

      it('creates venue if it does not exist, and adds it to user.favorites', function (done) {
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: newHotelInfo,
          })
          .end(function (err, res) {
            Venue.count({ lookUpId: newHotelInfo.id }, function (err, c) {
              expect(c).to.equal(1);

              User.findById(testUser._id, function (err, user) {
                expect(user.favorites.length).to.equal(2); // other favorite added in beforeEach()
                done();
              });
            });
          });
      });

      it('just $set updates user\'s rating when it exists', function (done) {
        // add rating
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: greenwichHotelInfo,
          })
          .end(function (err, res) {
            // update rating
            request
              .post('/api/rating/')
              .send({
                groupId: group._id,
                rating: 7,
                userId: testUser._id,
                venue: greenwichHotelInfo,
              })
              .end(function (err, res) {
                User.findById(testUser._id, function (err, user) {
                  // there should still be only 1 rating
                  expect(user.favorites.length).to.equal(1);
                  // rating val should be updated
                  expect(user.favorites[0].rating).to.equal(7);
                  done();
                });
              });
          });
      });

      it('creates group rating for venue when it does not exist', function (done) {
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: greenwichHotelInfo,
          })
          .end(function (err, res) {
            Group.findById(group._id, function (err, group) {
              // A rating should've been added by last request
              expect(group.favorites.length).to.equal(1);

              request
                .post('/api/rating/')
                .send({
                  groupId: group._id,
                  rating: 7,
                  userId: testUser._id,
                  venue: greenwichHotelInfo,
                })
                .end(function (err, res) {
                  Group.findById(group._id, function (err, group) {
                    // No rating should've been added by last request
                    expect(group.favorites.length).to.equal(1);
                    done();
                  });
                });
            });
          });
      });

      it('adds user rating to group\'s ratings', function (done) {
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: greenwichHotelInfo,
          })
          .end(function (err, res) {
            Group.findById(group._id)
              .populate({
                path: 'favorites',
                populate: { path: 'venue' }
              })
              .exec(function (err, group) {
                var groupVenueRatings = group.favorites[0];
                var userRating = groupVenueRatings.allRatings[0].userRating;

                expect(userRating).to.equal(10);
                done();
              });
          });
      });

      it('returns group.favorites, populated', function (done) {
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: greenwichHotelInfo,
          })
          .end(function (err, res) {
            var favorites = res.body;
            var groupVenueRatings = favorites[0];
            var userRating = groupVenueRatings.allRatings[0].userRating;

            expect(userRating).to.equal(10);
            done();
          });
      });

      it('just $set updates group\'s ratings when the user already rated it', function (done) {
        // add rating
        request
          .post('/api/rating/')
          .send({
            groupId: group._id,
            rating: 10,
            userId: testUser._id,
            venue: greenwichHotelInfo,
          })
          .end(function (err, res) {
            // add another user's rating
            request
              .post('/api/rating/')
              .send({
                groupId: group._id,
                rating: 1,
                userId: testUser2._id,
                venue: greenwichHotelInfo,
              })
              .end(function (err, res) {
                // update rating
                request
                  .post('/api/rating/')
                  .send({
                    groupId: group._id,
                    rating: 7,
                    userId: testUser._id,
                    venue: greenwichHotelInfo,
                  })
                  .end(function (err, res) {
                    var favorites = res.body;
                    var groupVenueRatings = favorites[0];

                    // Last request should not have added another rating
                    expect(groupVenueRatings.allRatings.length).to.equal(2);

                    var userRatingA = groupVenueRatings.allRatings[0].userRating;
                    var userRatingB = groupVenueRatings.allRatings[1].userRating;
                    var ratings = [userRatingA, userRatingB];

                    // other user's rating
                    expect(_.contains(ratings, 1)).to.equal(true);
                    // original user's updated rating
                    expect(_.contains(ratings, 7)).to.equal(true);
                    done();
                  });
              });
          });
      });
    });

    describe('getRatings()', function () {

      it('should get group\'s favorites', function (done) {
        request
          .get('/api/rating/')
          .query({ groupId: group._id })
          .end(function (err, res) {
            if (err) return done(err);
            var favorites = res.body;

            expect(favorites.length).to.equal(1);
            expect(favorites[0].groupId).to.equal(group._id);
            done();
          });
      });
    });
  });
});

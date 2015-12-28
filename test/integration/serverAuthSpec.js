process.env.NODE_ENV = 'test';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

var server = require(path.join(__dirname, '../../app/server/server'));
var testUtil = require(path.join(__dirname, '../testUtil'));
var User = require(path.join(__dirname, '../../app/server/models/user'));


describe('Auth', function () {

  before(function (done) {
    // TravisCI has been timing out at the default 2000
    this.timeout(5000);

    request = request(server);
    con = mongoose.createConnection('mongodb://localhost/tripapptest');

    setTimeout(function () {
      testUtil.dropDb(con, done)
    }, 1000);  // on @ZacharyRSmith's machine, connection needs ~15ms to set up
  });

  beforeEach(function (done) {
    testUtil.dropDb(con, done);
  });

  describe('local strategy', function () {
    
    it('/api/auth/signup returns a new user object', function (done) {
      request
        .post('/api/auth/signup')
        .send({
          username: 'username',
          password: 'password'
        })
        .end(function (err, res) {
          var user = res.body.user;

          User.findById(user._id, function (err, user) {
            expect(user.username).to.equal('username');
            done();
          });
        });
    });

    it('/api/auth/signup does not allow a duplicate email/username', function (done) {
      request
        .post('/api/auth/signup')
        .send({
          username: 'sameUsername',
          password: 'password'
        })
        .end(function (err, res) {

          request
            .post('/api/auth/signup')
            .send({
              username: 'SaMeUsErname',
              password: 'password'
            })
            .end(function (err, res) {
              expect(res.body.message).to.equal('Username already exists');
              done();
            });
        });
    });

    describe('/api/auth/login', function () {
      
      beforeEach(function (done) {
        request
          .post('/api/auth/signup')
          .send({
            username: 'username',
            password: 'password'
          })
          .end(function (err, res) {
            expect(res.body.status).to.equal(true);
            done();
          });
      });

      it('rejects bad password', function (done) {
        request
          .post('/api/auth/login')
          .send({
            username: 'username',
            password: 'badPassword'
          })
          .end(function (err, res) {
            expect(res.body.message).to.equal('Wrong Password');
            done();
          });
      });

      it('rejects bad username', function (done) {
        request
          .post('/api/auth/login')
          .send({
            username: 'whoAmI',
            password: 'badPassword'
          })
          .end(function (err, res) {
            expect(res.body.message).to.equal('No user found');
            done();
          });
      });

      it('logs user in', function (done) {
        request
          .post('/api/auth/login')
          .send({
            username: 'username',
            password: 'password'
          })
          .end(function (err, res) {
            expect(res.body.status).to.equal(true);
            done();
          });
      });
    });
  });
});

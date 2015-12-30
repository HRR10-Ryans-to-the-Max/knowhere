process.env.NODE_ENV = 'test'; // use test database

var expect = require('chai').expect;
var express = require('express');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var path = require('path');
var request = require('supertest');

var server = require(path.join(__dirname, '../../app/server/server'));
var testUtil = require(path.join(__dirname, '../testUtil'));
var util = require(path.join(__dirname, '../../app/server/util'));


describe('Server', function () {

  var con;

  before(function (done) {
    request = request(server);

    // TODO Refactor how how con is set?
    con = mongoose.createConnection('mongodb://localhost/tripapptest');
    // con = mongoose.connection;

    setTimeout(function () {
      testUtil.dropDb(con, done)
    }, 100); // on @ZacharyRSmith's machine, connection needs ~15ms to set up
  });

  beforeEach(function (done) {
    testUtil.dropDb(con, done);
  });


  after(function (done) {
    testUtil.dropDb(con, function () {
      con.close(done);
    });
  });

  afterEach(function (done) {
    testUtil.dropDb(con, done);
  });

  it('works', function (done) {
    expect(con).to.be.ok;

    request
      .get('/')
      .expect(200, done);
  });

  describe('util', function () {

    describe('mailer', function () {

      // The test below requires process.env.GMAIL_PASS
      // For now, TravisCI does not have access to it.
      // So, keep this test pending
      xit('should provide nodemailer\'s sendMail function', function (done) {
        this.timeout(5000);

        var mailOptions = {
            from: 'Knowhere ✔ <appKnowhere@gmail.com>', // sender address
            to: 'zacharysmith4989@gmail.com', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world ✔', // plaintext body
            html: '<b>Hello world ✔</b>' // html body
        };

        util.mailer.sendMail(mailOptions, function (err, info) {
          if (err) return console.error(err);

          // 250 is the SMTP reply code for mail action okay
          // See more: http://www.greenend.org.uk/rjk/tech/smtpreplies.html
          expect(/250/.test(info.response));
          done();
        });
      });
    });
  });
});

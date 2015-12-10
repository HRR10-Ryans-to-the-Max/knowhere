var db = require('../../../db/db.js');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
// methods ======================
// generating a hash
db.userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
db.userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
var User = mongoose.model('User', db.userSchema);

module.exports = User;
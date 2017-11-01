
let mongoose = require('mongoose');
let config = require('../config');

mongoose.Promise = global.Promise;
mongoose.connect(config.MONGODB_URL, {
    useMongoClient: true
}, function (err) {
	if (err) {
		config.log.fatal('connect to %s error: ', config.MONGODB_URL, err.message);
		process.exit(1);
	}
});

let NormalLogin = exports.NormalLogin = require('./normal_login');
let User = exports.User = require('./user');

let Contest = exports.Contest = require('./contest');
let ContestSign = exports.ContestSign = require('./contest_sign');

let mongoose = require('mongoose');
let config = require('../config');

mongoose.Promise = global.Promise;

let NormalLogin = exports.NormalLogin = require('./normal_login');
let GithubLogin = exports.GithubLogin = require('./github_login');
let User = exports.User = require('./user');

let Contest = exports.Contest = require('./contest');
let ContestSign = exports.ContestSign = require('./contest_sign');

let OauthAPP = exports.OauthAPP = require('./oauth_app');
let OauthAccessToken = exports.OauthAccessToken = require('./oauth_access_token');

mongoose.connect(config.MONGODB_URL, {
    useMongoClient: true
}, function (err) {
	if (err) {
		config.log.error('connect to %s error: ', config.MONGODB_URL, err.message);
		process.exit(1);
	}
	function errtoexit(err) {
		config.log.error(err);
		process.exit(1);
	}

	const models = [NormalLogin, GithubLogin, User, Contest, ContestSign];
	for(let m of models)
	{
		m.find().batchSize(30).cursor()
			.on('data', (e) => {
				e.save().catch(errtoexit);
			}).on('error', errtoexit);
	}
});
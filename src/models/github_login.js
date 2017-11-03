
let mongoose = require('mongoose');
let _ = require('lodash');

// github登录
let githubLoginSchema = new mongoose.Schema({

	id: {
		type: Number,
		required: true,
		unique: true
	},
	login: String,
	avatar_url: String,
	url: String,
	html_url: String,

	userID : {
		type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true
	},

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GithubLogin", githubLoginSchema);
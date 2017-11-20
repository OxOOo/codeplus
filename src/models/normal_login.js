
let mongoose = require('mongoose');
let _ = require('lodash');

// 用户普通登录
let normalLoginSchema = new mongoose.Schema({

	username: {
		type: String,
		required: true,
		unique: true
	},
	password: { // 加密后的密码
		type: String,
		required: true,
	},
	random_salt: { // 随机盐, password = sha256(real_password + random_salt)
		type: String,
		required: true
	},

	oj_username: {
		type: String,
		required: true,
	},
	oj_password: {
		type: String,
		required: true
	},

	userID : {
		type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true,
		unique: true
	},

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NormalLogin", normalLoginSchema);
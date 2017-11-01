
let mongoose = require('mongoose');
let _ = require('lodash');

// 用户
let userSchema = new mongoose.Schema({

	nickname: {
		type: String,
		required: true
	},

	// 邮箱
	email_passed: { // 邮箱是否通过验证
		type: Boolean,
		required: true,
		default: false
	},
	email: String,
	email_will: String, // 将要设置的邮箱
	email_code: String,
	email_code_expire: Date,

	// 基本信息
	info_filled: { // 是否已填基本信息
		type: Boolean,
		required: true,
		default: false
	},
	real_name: {
		type: String,
		minlength: 1
	},
	school: {
		type: String,
		minlength: 1
	},
	sex: {
		type: String,
		minlength: 1
	},
	phone_number: {
		type: String,
		minlength: 1
	},

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
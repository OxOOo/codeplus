
let mongoose = require('mongoose');
let _ = require('lodash');

// 用户
let userSchema = new mongoose.Schema({

	nickname: {
		type: String,
		required: true,
		unique: true,
		match: /^[\S]+$/,
	},

	is_admin: Boolean, // 是否管理员

	// 邮箱
	email_passed: { // 邮箱是否通过验证
		type: Boolean,
		required: true,
		default: false
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		sparse: true
	},
	email_will: String, // 将要设置的邮箱
	email_code: String,
	email_last_send_time: Date, // 上次发送的时间
	email_code_expire: Date, // 验证码过期时间

	// 通过邮箱找回密码
	forgot_password_last_send_time: Date, // 上次发送的时间
	forgot_password_code: String,
	forgot_password_code_expire: Date, // 验证码过期时间

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
	address: {
		type: String,
		minlength: 1
	},
	tshirt_size: {
		type: String,
		minlength: 1
	},
	
	T1_code: String,
	T2_code: String,
	T3_code: String,
	T4_code: String,
	T5_code: String,
	T6_code: String,

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);

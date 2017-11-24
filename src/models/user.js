
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
	email: {
		type: String,
		trim: true,
		unique: true,
		sparse: true
	},
	email_will: String, // 将要设置的邮箱
	email_code: String,
	email_code_expire: Date,

	// 通过邮箱找回密码
	forgot_password_code: String,
	forgot_password_code_expire: Date,

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

    express_info: {
      type: new mongoose.Schema({
        // Address
        prov: String,
        city: String,
        county: String,
        addr: String,

        receiver: String,
        phone: String,
        school: String,
      }),
      default: {},
    },

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);

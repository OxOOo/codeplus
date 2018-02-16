
let mongoose = require('mongoose');
let _ = require('lodash');

// 邮件黑名单,优先级<=0的邮件会检查黑名单
let emailBlacklistSchema = new mongoose.Schema({

	email: {
		type: String,
		required: true,
		unique: true,
		index: true
	},

	created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EMailBacklist", emailBlacklistSchema);

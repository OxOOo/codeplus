
let mongoose = require('mongoose');
let _ = require('lodash');

// 反馈
let feedbackSchema = new mongoose.Schema({
	userID: {
		type : mongoose.Schema.ObjectId,
		ref : 'User',
	},

	ip: String,

	content: String,

	created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);

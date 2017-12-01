
let mongoose = require('mongoose');
let _ = require('lodash');

// OAUTH
let oauthAPPSchema = new mongoose.Schema({

	app_id: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	app_secret: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true,
	},

	contest_info_accessable: {
		type: Boolean,
		required: true,
		default: false
	},

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OauthAPP", oauthAPPSchema);
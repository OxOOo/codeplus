
let mongoose = require('mongoose');
let _ = require('lodash');

// OauthAccessToken
let oauthAccessTokenSchema = new mongoose.Schema({

    code: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    access_token: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    expire_time: {
        type: Date,
        required: true
    },

	oauthAPPID: {
		type : mongoose.Schema.ObjectId,
		ref : 'OauthAPP',
        required: true
    },
    userID: {
        type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true,
    },

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OauthAccessToken", oauthAccessTokenSchema);
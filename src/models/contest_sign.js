
let mongoose = require('mongoose');
let _ = require('lodash');

// 比赛报名
let contestSignSchema = new mongoose.Schema({

    userID: {
        type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true
    },

    contestID: {
		type : mongoose.Schema.ObjectId,
		ref : 'Contest',
		required: true
    },

    type: {
        type: String,
        required: true
    },

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContestSign", contestSignSchema);
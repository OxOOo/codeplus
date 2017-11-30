
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

    has_award: Boolean, // 是否获奖
    rank: Number, // 排名

    // 快递信息
    express_info_filled: Boolean,
    // Address
    prov: String,
    city: String,
    county: String,
    addr: String,

    receiver: String,
    phone: String,
    school: String,

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContestSign", contestSignSchema);
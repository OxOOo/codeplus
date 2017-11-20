
let mongoose = require('mongoose');
let _ = require('lodash');

// 比赛
let contestSchema = new mongoose.Schema({

    no: { // 用于排序，数字大的表示最近的比赛
        type: Number,
        required: true,
        default: -1
    },

    public: {
        type: Boolean,
        required: true,
        default: false,
    },

    begin_sign_time: {
        type: Date,
        required: true,
    },
    end_sign_time: {
        type: Date,
        required: true,
    },

    title: {
        type: String,
        required: true,
        default: '这里是比赛标题'
    },

    description: {
        type: String,
        required: true,
        default: "这里是比赛描述，markdown格式"
    },

    signup_form_url: {
        type: String,
        defualt: "如果有可下载的报名表链接，请在这里填入",
    },

    terms: { // 报名协议
        type: String,
    },

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contest", contestSchema);


let mongoose = require('mongoose');
let _ = require('lodash');

// 比赛
let contestSchema = new mongoose.Schema({

    no: { // 用于排序，数字大的表示最近的比赛
        type: Number,
        required: true,
        default: -1
    },

    public: { // 是否公开
        type: Boolean,
        required: true,
        default: false,
    },

    begin_sign_time: { // 注册开放时间
        type: Date,
        required: true,
    },
    end_sign_time: { // 注册结束时间
        type: Date,
        required: true,
    },
    begin_contest_time: { // 比赛开放时间
        type: Date,
        required: true,
    },
    end_contest_time: { // 比赛结束时间
        type: Date,
        required: true,
    },

    repository_local_name: { // 本地仓库名称
        type: String,
        match: /^[\S]+$/,
    },

    title: {
        type: String,
        required: true,
        match: /^[\S]+$/,
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

    rank_msg: String, // 排名说明
    div1_ranklist: String,
    div2_ranklist: String,
    div1_contest_id: Number, // OJ上的比赛ID
    div2_contest_id: Number, // OJ上的比赛ID
    practise_contest_id: Number, // 练习赛ID

    express_info_end: {
        type: Boolean, // 快递填写是否结束
        required: true,
        default: false
    },

    notices: [{
        title: String,
        datetime: Date,
        content: String,
        hidden_names: [String]
    }],

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contest", contestSchema);

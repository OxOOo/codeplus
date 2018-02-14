
let mongoose = require('mongoose');
let _ = require('lodash');

// 待发送的邮件
let emailToSendSchema = new mongoose.Schema({
    templateID : {
		type : mongoose.Schema.ObjectId,
		ref : 'email_template',
		required: true,
    },
    to: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    env: Object,
    priority: { // 优先级,先发送大的,默认0
        type: Number,
        required: true,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },

    has_sent: { // 是否已发送
        type: Boolean,
        required: true,
        default: false
    },
    sent_at: Date, // 发送时间
    send_api: String, // 发送API及版本
    render_msg: String, // 渲染信息
    error_msg: String, // 错误信息
    info_msg: String, // 发送消息
});

module.exports = mongoose.model("email_to_send", emailToSendSchema);

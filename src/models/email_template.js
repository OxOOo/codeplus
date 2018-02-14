
let mongoose = require('mongoose');
let _ = require('lodash');

// 邮件模板
let emailTemplateSchema = new mongoose.Schema({
    title: { // 标题
        type: String,
        required: true,
        index: true,
        unique: true
    },
    content: { // ejs模板内容
        type: String,
        required: true,
    },
    default_env: Object,
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("email_template", emailTemplateSchema);

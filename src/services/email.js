
let email = require("emailjs/email");
let utils = require('utility');
let qs = require('querystring');

let { User } = require('../models');
let { EMAIL, SERVER } = require('../config');
let auth = require('./auth');
let tools = require('./tools');

let server 	= email.server.connect({
    user: EMAIL.USER,
    password: EMAIL.PASSWORD, 
    host: EMAIL.HOST, 
    ssl: EMAIL.SSL
});

// 激活邮箱
exports.sendActiveEmail = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            let url = SERVER.URL_PREFIX + '/check_email_code?' + qs.stringify({code: user.email_code, user_id: user._id.toString()});
            server.send({
                text: `激活链接 : ${url}`,
                from: `Code+ <${EMAIL.USER}>`,
                to: `${tools.emailName(user.email_will)} <${user.email_will}>`,
                subject: "Code+邮箱验证",
                attachment: [
                    { data: `<a href="${url}">激活链接</a> : ${url}`, alternative: true },
                ],
            }, function(err, message) {
                if (err) reject(err);
                else resolve();
            });
        } catch(e) {
            reject(e);
        }
    });
}

// 忘记密码
exports.sendForgotEmail = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            server.send({
                text: `验证码：${user.forgot_password_code}`,
                from: `Code+ <${EMAIL.USER}>`,
                to: `${tools.emailName(user.email_will)} <${user.email_will}>`,
                subject: "Code+密码找回"
            }, function(err, message) {
                if (err) reject(err);
                else resolve();
            });
        } catch(e) {
            reject(e);
        }
    });
}

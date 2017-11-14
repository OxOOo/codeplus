
let email = require("emailjs/email");
let utils = require('utility');
let qs = require('querystring');
let juice = require('juice');
let ejs = require('ejs');
let h2t = require('html-to-text');
let fs = require('fs');
let path = require('path');

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

let activeTmpl = ejs.compile(fs.readFileSync(path.resolve(__dirname, "../../views/mails/active.html")).toString('utf-8'));
let forgotTmpl = ejs.compile(fs.readFileSync(path.resolve(__dirname, "../../views/mails/forgot.html")).toString('utf-8'));

// 激活邮箱
exports.sendActiveEmail = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
          console.log(user);
            let url = SERVER.URL_PREFIX + '/check_email_code?' + qs.stringify({code: user.email_code, user_id: user._id.toString()});
            let mailContent = activeTmpl({ name: user.nickname, link: url });
            server.send({
                text: h2t.fromString(mailContent, { wordwrap: 80 }),
                from: `Code+ <${EMAIL.USER}>`,
                to: `${tools.emailName(user.email_will)} <${user.email_will}>`,
                subject: "Code+ 邮箱验证",
                attachment: [
                    { data: juice(mailContent), alternative: true },
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
            let mailContent = forgotTmpl({ name: user.nickname, code: user.forgot_password_code});
            server.send({
                text: h2t.fromString(mailContent, { wordwrap: 80 }),
                from: `Code+ <${EMAIL.USER}>`,
                to: `${tools.emailName(user.email_will)} <${user.email_will}>`,
                subject: "Code+ 密码找回",
                attachment: [
                  { data: juice(mailContent), alternative: true },
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

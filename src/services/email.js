
let _ = require('lodash');
let qs = require('querystring');
let ejs = require('ejs');
let mzfs = require('mz/fs');
let path = require('path');

let { User, EMailTemplate, EMailToSend } = require('../models');
let { SERVER } = require('../config');

// 激活邮箱
exports.sendActiveEmail = async (user) => {
    const ACTIVE_TEMPLATE_TITLE = '激活邮箱模板';
    const ACTIVE_TEMPLATE_PATH = path.resolve(__dirname, "../../views/mails/active.html");

    let url = SERVER.URL_PREFIX + '/check_email_code?' + qs.stringify({code: user.email_code, user_id: user._id.toString()});
    let logo = SERVER.URL_PREFIX + '/assets/images/cplogo.svg';

    let template = await EMailTemplate.findOne({title: ACTIVE_TEMPLATE_TITLE});
    if (!template) {
        template = await EMailTemplate.create({
            title: ACTIVE_TEMPLATE_TITLE,
            content: await mzfs.readFile(ACTIVE_TEMPLATE_PATH, 'utf-8'),
            default_env: {
                nickname: '未知',
                link: SERVER.URL_PREFIX,
                logo: logo
            }
        });
    }

    await EMailToSend.create({
        templateID: template._id,
        to: user.email_will,
        subject: 'Code+ 邮箱验证',
        env: {
            nickname: user.nickname,
            link: url,
            logo: logo
        },
        priority: 1
    });
}

// 忘记密码
exports.sendForgotEmail = async (user) => {
    const FORGOT_TEMPLATE_TITLE = '忘记密码模板';
    const FORGOT_TEMPLATE_PATH = path.resolve(__dirname, "../../views/mails/forgot.html");

    let logo = SERVER.URL_PREFIX + '/assets/images/cplogo.svg';

    let template = await EMailTemplate.findOne({title: FORGOT_TEMPLATE_TITLE});
    if (!template) {
        template = await EMailTemplate.create({
            title: FORGOT_TEMPLATE_TITLE,
            content: await mzfs.readFile(FORGOT_TEMPLATE_PATH, 'utf-8'),
            default_env: {
                nickname: '未知',
                code: null,
                logo: logo
            }
        });
    }

    await EMailToSend.create({
        templateID: template._id,
        to: user.email,
        subject: 'Code+ 密码找回',
        env: {
            code: user.forgot_password_code,
            logo: logo
        },
        priority: 1
    });
}

// 渲染
let renderTemplate = exports.renderTemplate = async (template, env) => {
    return ejs.compile(template)(env);
}

// 提取变量
let selectVariable = exports.selectVariable = async (user) => {
    return user.toJSON();
}

// 渲染任务
exports.renderEmailTask = async (task) => {
    let template = await EMailTemplate.findById(task.templateID);
    let user = await User.findOne({email: task.to});

    let env = {};
    _.assign(env, template.default_env);
    if (user) _.assign(env, await selectVariable(user));
    _.assign({email: task.to, to: task.to});
    if (task.env) _.assign(env, task.env);

    return await renderTemplate(template.content, env);
}

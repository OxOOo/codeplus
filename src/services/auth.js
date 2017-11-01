
let lodash = require('lodash');
let utils = require('utility');
let { User, NormalLogin } = require('../models');
require('should');

const ERR_CODE = 978;

/// 用户中间件
/// 检查用户是否已经登陆，查询数据库并放在ctx.state.user变量上
let userM = exports.userM = async function (ctx, next) {
	let user_id = ctx.session.user_id;
    ctx.state.user = null;
    
	if (user_id) {
        ctx.state.user = await User.findById(user_id);
        ctx.state.normal_login = await NormalLogin.findOne({userID: user_id});
	}

	try {
		await next();
	} catch(e) {
		if (e.status === ERR_CODE) {
            ctx.state.flash.error = e._msg;
            await ctx.redirect('back');
		} else {
            ctx.state.flash.error = e.message;
            await ctx.redirect('back');
            console.error(e.message);
        }
	}
}

let assert = exports.assert = function (condition, msg) {
    msg.should.be.a.String();

	if (!condition) {
		let err = new Error();
        err.status = ERR_CODE;
        err._msg = msg;
		throw err;
	}
}

// 正常登陆
exports.normal_login = async function (ctx, username, password) {
    let login = await NormalLogin.findOne({username: username});
    assert(login, '用户不存在');
    assert(login.password == utils.sha256(password + login.random_salt), '密码错误');

    ctx.session.user_id = login.userID;
	ctx.state.user = await User.findById(login.userID);
}

exports.register = async function (ctx, username, password) {
    assert(!await NormalLogin.findOne({username: username}), '用户名已存在');
    
    let login = new NormalLogin();
    login.username = username;
    login.random_salt = utils.randomString(32, '1234567890');
    login.password = utils.sha256(password + login.random_salt);

    let user = new User();
    login.userID = user._id;
    user.nickname = username;

    await login.save();
    await user.save();

    ctx.session.user_id = user._id;
	ctx.state.user = user;
}

exports.modifyPassword = async function (ctx, password) {
    let login = ctx.state.normal_login;
    login.password = utils.sha256(password + login.random_salt);

    await login.save();
}

// 登出
exports.logout = async function (ctx) {
	ctx.session.user_id = null;
}

/// 需用户登陆
exports.loginRequired = async function (ctx, next) {
    assert(ctx.state.user, '尚未登录');
	await next();
}
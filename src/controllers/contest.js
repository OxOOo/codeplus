
let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let utils = require('utility');
require('should');

let config = require('../config');
let { User, Contest, ContestSign } = require('../models');
let auth = require('../services/auth');

const FRIENDLY_CHARSET = "123456789qwertyuplkjhgfdsazxcvbnmQWERTYUPKJHGFDSAZXCVBNM";

const router = module.exports = new Router();

// 首页
router.get('/', async (ctx, next) => {
    let contest = await Contest.findOne({public: true}).sort('-no');
    let contest_sign = null;
    if (ctx.state.user) {
        contest_sign = await ContestSign.findOne({userID: ctx.state.user._id, contestID: contest._id});
    }
    await ctx.render("index", { contest: contest, contest_sign: contest_sign, current_page: '/' });
});

async function ContestSignCheck(contest_id) {
    let contest = await Contest.findById(contest_id);
    auth.assert(contest, '比赛不存在');
    auth.assert(contest.begin_sign_time <= Date.now() && Date.now() <= contest.end_sign_time, '不在报名开放时间内');
    auth.assert(contest.public, '比赛未公开');

    return contest;
}

// 报名
router.get('/contests/sign', auth.loginRequired, async (ctx, next) => {
    ctx.request.query.contest_id.should.be.a.String().and.not.empty();
    ctx.request.query.user_id.should.be.a.String().and.not.empty();

    auth.assert(ctx.state.user.email_passed, '尚未关联邮箱，不能报名，前往<a href="/modify">关联邮箱</a>');
    auth.assert(ctx.state.user.info_filled, '基本信息不完善，不能报名，前往<a href="/modify">完善基本信息</a>');

    let contest = await ContestSignCheck(ctx.request.query.contest_id);

    let contest_sign = await ContestSign.findOne({userID: ctx.state.user._id, contestID: contest._id});
    auth.assert(!contest_sign, '已报名');

    let username;
    let password = utils.randomString(10, FRIENDLY_CHARSET);
    do {
        username = utils.randomString(10, FRIENDLY_CHARSET);
        if (!await ContestSign.findOne({username})) break;
    } while(true);

    await ContestSign.create({userID: ctx.state.user._id, contestID: contest._id, username: username, password: password});
    ctx.state.flash.success = `报名成功,用户名是'${username}',可在页面下方查看密码`;
    await ctx.redirect('back');
});

// 取消报名
router.get('/contests/unsign', auth.loginRequired, async (ctx, next) => {
    ctx.request.query.contest_id.should.be.a.String().and.not.empty();
    ctx.request.query.user_id.should.be.a.String().and.not.empty();

    let contest = await ContestSignCheck(ctx.request.query.contest_id);

    let contest_sign = await ContestSign.findOne({userID: ctx.state.user._id, contestID: contest._id});
    auth.assert(contest_sign, '未报名');

    await contest_sign.remove();
    ctx.state.flash.success = "取消报名成功";
    await ctx.redirect('back');
});


let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let utils = require('utility');
let qs = require('querystring');
let request = require('superagent');
let moment = require('moment');
require('should');

let config = require('../config');
let { User, NormalLogin, Contest, ContestSign } = require('../models');
let auth = require('../services/auth');
let tools = require('../services/tools');
let email = require('../services/email');

const router = module.exports = new Router();

router.get('/admin', auth.adminRequired, async (ctx, next) => {
    let contests = await Contest.find().sort('-no');
    await ctx.render("admin_contests", {layout: 'admin_layout', contests: contests});
});
router.get('/admin/contests/:contest_id', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');

    await ctx.render('admin_contest', {layout: 'admin_layout', contest: contest});
});
router.post('/admin/contests/:contest_id', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();
    let info = ctx.request.body;
    info.public = info.public ? true : false;
    info.begin_sign_time = ctx.state.moment_parse(info.begin_sign_time);
    info.end_sign_time = ctx.state.moment_parse(info.end_sign_time);

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    _.assign(contest, _.pick(info, [
        'no', 'public',
        'begin_sign_time', 'end_sign_time', 'title',
        'description', 'terms',
        'repository_local_name',
        'rank_msg', 'div1_ranklist', 'div2_ranklist',
    ]));
    await contest.save();

    await ctx.redirect('back');
});
router.get('/admin/contests/:contest_id/preview', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');

    await ctx.render('admin_contest_preview', {layout: 'admin_layout', contest: contest});
});
router.post('/admin/contests/:contest_id/update_award', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();
    ctx.request.body.userlist.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');

    await ContestSign.update({contestID: contest._id}, {$set: {has_award: false}}, {multi: true});
    let names = ctx.request.body.userlist.split('\n');
    let count = 0;
    for(let name of names) {
        name = _.trim(name);
        let login = await NormalLogin.findOne({username: name});
        if (!login) continue;
        let sign = await ContestSign.findOne({userID: login.userID, contestID: contest._id});
        if (!sign) continue;
        sign.has_award = true;
        await sign.save();
        count ++;
    }

    ctx.state.flash.success = `有${count}人获奖`;
    await ctx.redirect('back');
});

// su
router.post('/su', auth.adminRequired, async (ctx, next) => {
    ctx.request.body.username.should.be.a.String().and.not.empty();
    let login = await NormalLogin.findOne({username: ctx.request.body.username});
    auth.assert(login, '用户不存在');
    await auth.login(ctx, login.userID);
    await ctx.redirect('/');
});
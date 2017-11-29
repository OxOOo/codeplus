
let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let utils = require('utility');
let qs = require('querystring');
let request = require('superagent');
let moment = require('moment');
let iconv = require('iconv-lite');
require('should');

let config = require('../config');
let { User, NormalLogin, Contest, ContestSign } = require('../models');
let auth = require('../services/auth');
let tools = require('../services/tools');
let email = require('../services/email');
let chelper = require('../services/chelper');

const router = module.exports = new Router();

router.get('/admin', auth.adminRequired, async (ctx, next) => {
    let contests = await Contest.find().sort('-no');
    await ctx.render("admin_contests", {layout: 'admin_layout', contests: contests});
});
router.get('/admin/contests/:contest_id', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');

    let award_signs = await ContestSign.find({has_award: true});
    let award_logins = await NormalLogin.find({userID: award_signs.map(x => {return x.userID;})});
    let award_names = award_logins.map(x => {return x.username;});

    await ctx.render('admin_contest', {layout: 'admin_layout', contest: contest, award_names: award_names});
});
router.post('/admin/contests/:contest_id', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();
    let info = ctx.request.body;
    info.public = info.public ? true : false;

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    _.assign(contest, _.pick(info, [
        'no', 'public',
        'begin_sign_time', 'end_sign_time', 'begin_contest_time', 'end_contest_time',
        'title',
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
    let names = ctx.request.body.userlist.split('\n').map(x => {return _.trim(x);});
    let logins = await NormalLogin.find({username: names});
    await ContestSign.update({userID: logins.map(x => {return x.userID})}, {$set: {has_award: true}}, {multi: true});

    ctx.state.flash.success = `有${logins.length}人获奖`;
    await ctx.redirect('back');
});
router.get('/admin/contests/:contest_id/express_info', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');

    let signs = await ContestSign.find({contestID: contest._id, has_award: true});
    let users = await User.find();
    let logins = await NormalLogin.find();
    tools.bindFindByXX(users, '_id');
    tools.bindFindByXX(logins, 'userID');

    let total_count = signs.length;
    let filled_count = await ContestSign.find({contestID: contest._id, has_award: true, express_info_filled: true}).count();
    let unfilled_count = total_count - filled_count;

    await ctx.render('admin_contest_express_info', {layout: 'admin_layout',
        contest: contest, signs: signs, users: users, logins: logins,
        total_count: total_count, filled_count: filled_count, unfilled_count: unfilled_count
    });
});
router.get('/admin/contests/:contest_id/express_info_download', auth.adminRequired, async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');

    ctx.set("Content-Disposition", "attachment; filename=" + qs.escape(contest.title) + ".csv" );
    let content = await chelper.fetchContestExpressInfoCSV(contest);
    if (ctx.request.query.encoding) {
        content = iconv.encode(content, ctx.request.query.encoding);
    }
    ctx.body = content;
});

router.get('/admin/control', auth.adminRequired, async (ctx, next) => {
    await ctx.render('admin_control', {layout: 'admin_layout'});
});
// su
router.post('/admin/su', auth.adminRequired, async (ctx, next) => {
    ctx.request.body.username.should.be.a.String().and.not.empty();
    let login = await NormalLogin.findOne({username: ctx.request.body.username});
    auth.assert(login, '用户不存在');
    await auth.login(ctx, login.userID);
    await ctx.redirect('/');
});
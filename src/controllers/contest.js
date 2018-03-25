
let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let utils = require('utility');
let mzfs = require('mz/fs');
let send = require('koa-send');
require('should');

let config = require('../config');
let { User, Contest, ContestSign, NormalLogin } = require('../models');
let auth = require('../services/auth');
let chelper = require('../services/chelper');
let tools = require('../services/tools');

const router = module.exports = new Router();

// 首页
router.get('/', async (ctx, next) => {
    let {contest, contest_sign} = await chelper.fetchLatestContest(ctx);
    await ctx.render("index", { contest: contest, contest_sign: contest_sign, current_page: '/', title: contest.title });
});

// 报名
router.get('/contests/sign', auth.loginRequired, async (ctx, next) => {
    ctx.request.query.contest_id.should.be.a.String().and.not.empty();
    ctx.request.query.user_id.should.be.a.String().and.not.empty();
    ctx.request.query.type.should.be.a.String().and.not.empty();

    auth.assert(ctx.state.normal_login, '尚未创建帐号，不能报名，前往<a href="/modify">创建帐号</a>');
    auth.assert(ctx.state.user.email_passed, '尚未关联邮箱，不能报名，前往<a href="/modify">关联邮箱</a>');
    auth.assert(ctx.state.user.info_filled, '基本信息不完善，不能报名，前往<a href="/modify">完善基本信息</a>');

    let contest = await chelper.contestSignCheck(ctx.request.query.contest_id);
    auth.assert(_.includes(contest.contests, ctx.request.query.type), '报名类型不正确');

    let contest_sign = await ContestSign.findOne({userID: ctx.state.user._id, contestID: contest._id});
    auth.assert(!contest_sign, '已报名');

    await ContestSign.create({
        userID: ctx.state.user._id,
        contestID: contest._id,
        type: ctx.request.query.type,
    });
    ctx.state.flash.success = `报名成功，比赛网站为<a href="https://oj.thusaac.org" target="_blank">https://oj.thusaac.org</a>`;
    await ctx.redirect('back');
});

// 取消报名
router.get('/contests/unsign', auth.loginRequired, async (ctx, next) => {
    ctx.request.query.contest_id.should.be.a.String().and.not.empty();
    ctx.request.query.user_id.should.be.a.String().and.not.empty();

    let contest = await chelper.contestSignCheck(ctx.request.query.contest_id);

    let contest_sign = await ContestSign.findOne({userID: ctx.state.user._id, contestID: contest._id});
    auth.assert(contest_sign, '未报名');

    await contest_sign.remove();
    ctx.state.flash.success = "取消报名成功";
    await ctx.redirect('back');
});

router.get('/contests', async (ctx, next) => {
    let contests = await Contest.find({public: true}).sort('-no');
    let my_contests = [];
    let my_signs = [];
    let my_awards = [];
    if (ctx.state.user) {
        my_signs = await ContestSign.find({userID: ctx.state.user._id});
        my_contests = await Contest.find({_id: my_signs.map(x => x.contestID)}).sort('-no');
        let award_signs = await ContestSign.find({userID: ctx.state.user._id, has_award: true});
        my_awards = await Contest.find({_id: award_signs.map(x => x.contestID)}).sort('-no');
        tools.bindFindByXX(my_signs, 'contestID');
    }
    await ctx.render('contests', {current_page: 'contests', title: "比赛列表", contests: contests, my_contests: my_contests, my_signs: my_signs, my_awards: my_awards});
});

router.get('/contests/:contest_id', async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    let contest_sign = null;
    if (ctx.state.user) {
        contest_sign = await ContestSign.findOne({userID: ctx.state.user._id, contestID: contest._id});
    }

    let contest_links = {};
    if (contest.end_contest_time < Date.now()) {
        try {
            contest_links.zip = await chelper.fetchZIPPath(contest);
        } catch(e) {
            console.error(e);
        }
        for(let type of contest.contests) {
            try {
                contest_links[type] = await chelper.fetchProblems(contest, type);
            } catch(e) {
                console.error(e);
            }
        }
    }

    await ctx.render('contest', {
        current_page: 'contests', title: contest.title,
        contest: contest, contest_sign: contest_sign,
        contest_links: contest_links,
    });
});

// 排名榜
router.get('/contests/:contest_id/ranklist/:type', async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();
    ctx.params.type.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    auth.assert(contest.end_contest_time < Date.now(), '比赛未结束');
    auth.assert(_.includes(contest.contests, ctx.params.type), '参数非法');

    let lines = contest.ranklist[ctx.params.type] ? contest.ranklist[ctx.params.type].split('\n').map(x => x.split('\t')) : '暂无';
    
    // prepare rating
    let name_idx = _.includes(lines[0], 'id') ? _.indexOf(lines[0], 'id') : -1;
    let has_rating = _.some(await ContestSign.find({contestID: contest._id, type: ctx.params.type}), x => x.rating_before);
    if (name_idx >= 0 && has_rating) {
        lines[0].push('Rating');

        let names = lines.slice(1).map(x => x[name_idx]);
        let logins = await NormalLogin.find({username: names});
        let signs = await ContestSign.find({contestID: contest._id, userID: logins.map(x => x.userID)});
        tools.bindFindByXX(logins, 'username');
        tools.bindFindByXX(signs, 'userID');

        for(let i = 1; i < lines.length; i ++) {
            let name = lines[i][name_idx];
            let s = signs.findByuserID(logins.findByusername(name).userID);
            if (s.rating_before) {
                lines[i].push(`${s.rating_before} ${s.rating_delta>=0?'+':'-'} ${Math.abs(s.rating_delta)} => ${s.rating_now}`);
            } else {
                lines[i].push('暂无');
            }
        }
    }

    let header = lines[0];
    let ranks = lines.slice(1);
    if (_.includes(header, 'id')) header[_.indexOf(header, 'id')] = '姓名';
    if (_.includes(header, 'rank')) header[_.indexOf(header, 'rank')] = '#';

    await ctx.render('contest_ranklist', {
        layout: false,
        type: ctx.params.type,
        contest: contest, header: header, ranks: ranks
    });
});

router.get('/contests/:contest_id/download', async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    auth.assert(contest.end_contest_time < Date.now(), '比赛未结束');

    let zip = await chelper.fetchZIPPath(contest);
    ctx.set("Content-Disposition", "attachment; filename=" + path.basename(zip));
    await send(ctx, zip);
});

router.get('/contests/:contest_id/problem/:type/:idx', async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();
    ctx.params.type.should.be.a.String().and.not.empty();
    ctx.params.idx.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    auth.assert(contest.end_contest_time < Date.now(), '比赛未结束');
    auth.assert(_.includes(contest.contests, ctx.params.type), '参数非法');

    let p = await chelper.fetchProblemInfo(contest, ctx.params.type, ctx.params.idx);

    await ctx.render('contest_problem', {
        current_page: 'contests', title: p.title + ' | ' + contest.title,
        contest: contest, problem: p
    });
});

router.get('/contests/:contest_id/solution/:type/:idx', async (ctx, next) => {
    ctx.params.contest_id.should.be.a.String().and.not.empty();
    ctx.params.type.should.be.a.String().and.not.empty();
    ctx.params.idx.should.be.a.String().and.not.empty();

    let contest = await Contest.findById(ctx.params.contest_id);
    auth.assert(contest, '比赛不存在');
    auth.assert(contest.end_contest_time < Date.now(), '比赛未结束');
    auth.assert(_.includes(contest.contests, ctx.params.type), '参数非法');

    let p = await chelper.fetchProblemInfo(contest, ctx.params.type, ctx.params.idx);

    ctx.set("Content-Disposition", "attachment; filename=" + p.name + '_' + path.basename(p.solution));
    await send(ctx, p.solution);
});
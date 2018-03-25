
let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let utils = require('utility');
let moment = require('moment');
require('should');

let config = require('../config');
let { User, NormalLogin, Contest, ContestSign, OauthAPP, OauthAccessToken } = require('../models');
let auth = require('../services/auth');
let tools = require('../services/tools');

const router = module.exports = new Router();

router.get('/oauth/authorize', auth.accountRequired, async ctx => {
    ctx.request.query.app_id.should.be.a.String().and.not.eql("", 'app_id未设置');
    ctx.request.query.redirect_uri.should.be.a.String().and.not.eql("", 'redirect_uri未设置');

    const app_id = ctx.request.query.app_id;
    const redirect_uri = ctx.request.query.redirect_uri;

    let app = await OauthAPP.findOne({app_id});
    auth.assert(app, '应用不存在', '/');

    let code = null;
    while(true) {
        code = utils.randomString(128, '0123456789qwertyuioplkjhgfdsazxcvbnm');
        if (!await OauthAccessToken.findOne({code})) break;
    }

    let access_token = null;
    while(true) {
        access_token = utils.randomString(128, '0123456789qwertyuioplkjhgfdsazxcvbnm');
        if (!await OauthAccessToken.findOne({access_token})) break;
    }
    await OauthAccessToken.create({
        code: code,
        access_token: access_token,
        expire_time: moment().add(moment.duration(3, 'minutes')).toDate(),
        oauthAPPID: app._id,
        userID: ctx.state.user._id
    });

    await ctx.redirect(redirect_uri + '?code=' + code);
});

router.post('/oauth/access_token', auth.jsonFormatError, async ctx => {
    ctx.request.body.app_id.should.be.a.String().and.not.empty();
    ctx.request.body.app_secret.should.be.a.String().and.not.empty();
    ctx.request.body.code.should.be.a.String().and.not.empty();

    let app = await OauthAPP.findOne({app_id: ctx.request.body.app_id});
    auth.assert(app, '应用不存在');
    auth.assert(app.app_secret == ctx.request.body.app_secret, 'app_secret不正确');

    let token = await OauthAccessToken.findOne({code: ctx.request.body.code});
    auth.assert(token, '认证不存在');
    auth.assert(token.expire_time > Date.now(), '已过期');

    ctx.body = {
        access_token: token.access_token
    };
});

router.get('/oauth/user', auth.jsonFormatError, async ctx => {
    ctx.request.query.access_token.should.be.a.String().and.not.empty();

    let token = await OauthAccessToken.findOne({access_token: ctx.request.query.access_token});
    auth.assert(token, '认证不存在');
    auth.assert(token.expire_time > Date.now(), '已过期');

    let user = await User.findById(token.userID);
    let info = _.pick(user, ['school']);
    info.userID = String(user._id);
    let account = await NormalLogin.findOne({userID: user._id});
    _.assign(info, _.pick(account, 'username', 'oj_username', 'oj_password'));

    ctx.body = info;
});

router.post('/oauth/contest_info', auth.jsonFormatError, async ctx => {
    ctx.request.body.app_id.should.be.a.String().and.not.empty();
    ctx.request.body.app_secret.should.be.a.String().and.not.empty();
    ctx.request.body.userID.should.be.a.String().and.not.empty();

    let app = await OauthAPP.findOne({app_id: ctx.request.body.app_id});
    auth.assert(app, '应用不存在');
    auth.assert(app.app_secret == ctx.request.body.app_secret, 'app_secret不正确');
    auth.assert(app.contest_info_accessable, '没有访问权限');

    let user = await User.findById(ctx.request.body.userID);
    auth.assert(user, '用户不存在');

    let signs = await ContestSign.find({userID: user._id});
    let contests = await Contest.find({_id: signs.map(x => {return x.contestID})});
    tools.bindFindByXX(contests, '_id');

    let ids = [];
    for(let s of signs) {
        let c = contests.findBy_id(s.contestID);
        let contest_id = c.contest_ids[s.type];
        if (_.isNumber(contest_id)) {
            ids.push(contest_id);
        }
        if (_.isNumber(c.contest_ids['practise'])) {
            ids.push(c.contest_ids['practise']);
        }
    }

    ctx.body = ids;
});


let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let utils = require('utility');
let qs = require('querystring');
let request = require('superagent');
require('should');

let config = require('../config');
let { User, NormalLogin } = require('../models');
let auth = require('../services/auth');
let tools = require('../services/tools');
let email = require('../services/email');

const router = module.exports = new Router();

// su
router.get('/su', auth.adminRequired, async (ctx, next) => {
    await ctx.render("su");
});
router.post('/su', auth.adminRequired, async (ctx, next) => {
    ctx.request.body.username.should.be.a.String().and.not.empty();
    let login = await NormalLogin.findOne({username: ctx.request.body.username});
    auth.assert(login, '用户不存在');
    await auth.login(ctx, login.userID);
    await ctx.redirect('/');
});
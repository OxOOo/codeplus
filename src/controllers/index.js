
let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
require('should');

let config = require('../config');
let { User } = require('../models');
let auth = require('../services/auth');

const router = module.exports = new Router();

let support_email = config.SUPPORT || config.EMAIL.USER;

router.get('/feedback', async ctx => {
    await ctx.render("feedback", { title: '反馈与支持', current_page: 'feedback', email: support_email });
});


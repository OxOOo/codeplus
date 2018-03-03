
let Router = require('koa-router');
let _ = require('lodash');
let path = require('path');
let mzfs = require('mz/fs');
let moment = require('moment');
require('should');

let config = require('../config');
let { User, Feedback, EMailBlacklist } = require('../models');
let auth = require('../services/auth');

const router = module.exports = new Router();

let support_email = config.SUPPORT || config.EMAIL.USER;

router.get('/faq', async ctx => {
    let faq = await mzfs.readFile(path.join(__dirname, '..', '..', 'faq.md'), 'utf-8');
    await ctx.render("faq", { title: 'FAQ', current_page: 'faq', faq: faq});
});

router.get('/feedback', async ctx => {
    await ctx.render("feedback", { title: '反馈与支持', current_page: 'feedback', email: support_email });
});

router.post('/feedback', async (ctx, next) => {
    let content = ctx.request.body.content;
    auth.assert(content && _.trim(content).length > 0, '反馈内容为空');
    content = _.trim(content);

    let last = await Feedback.findOne({}).sort('-_id');
    auth.assert(!last || moment(last.created_at).add(10, 's').isBefore(moment.now()), '反馈太频繁,请稍后再试');

    let feedback = new Feedback();
    if (ctx.state.user) feedback.userID = ctx.state.user._id;
    feedback.ip = ctx.state.ip;
    feedback.content = content;
    await feedback.save();

    ctx.state.flash.success = '反馈成功,谢谢支持';
    await ctx.redirect('back');
});

router.get('/email_subscribe', async (ctx, next) => {
    let email = ctx.query.email;
    auth.assert(email, '需要email');
    await EMailBlacklist.remove({email});
    ctx.state.success = '订阅成功';
    await ctx.redirect('back');
});

router.get('/email_unsubscribe', async (ctx, next) => {
    let email = ctx.query.email;
    auth.assert(email, '需要email');

    if (await EMailBlacklist.findOne({email})) {
        ctx.state.flash.error = '已经取消订阅,无法重复取消';
    } else {
        await EMailBlacklist.create({email});
        ctx.state.flash.success = '取消订阅成功';
    }
    
    await ctx.redirect('/');
});

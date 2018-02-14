
// 网站

let _ = require('lodash');
let Koa = require('koa');
let Router = require('koa-router');
let mount = require('koa-mount');
let render = require('./services/ejs_render');
let bodyParser = require('koa-bodyparser');
let path = require('path');
let MarkdownIt = require('markdown-it');
let moment = require('moment');
let session = require('koa-session');

let config = require('./config');
let { log, SERVER } = require('./config');
let auth = require('./services/auth');
let flash = require('./services/flash');
let chelper = require('./services/chelper');

let app = new Koa();

app.use(bodyParser({
    formLimit: '10MB'
}));
render(app, {
    root: path.join(__dirname, '..', 'views'),
    layout: 'layout',
    viewExt: 'html',
    cache: false,
    debug: false
});
app.keys = [config.SERVER.SECRET_KEYS];
const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.use(session(CONFIG, app));

app.use(async (ctx, next) => {
    ctx.state.md = new MarkdownIt({
        html: true
    });
    ctx.state.moment_format = function(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ssZZ');
    }
    ctx.state.moment_format_short = function(date) {
        return moment(date).format('MM-DD HH:mm');
    }
    ctx.state.moment_parse = function(date) {
        return moment(date, 'YYYY-MM-DD HH:mm:ssZZ').toDate();
    }
    ctx.state.is_moment_new = function(date) {
        return moment(date).add(moment.duration(1, 'day')) > moment.now();
    }
    ctx.state.translate_hidden_names = function(content, hidden_names, myname) {
        for(let name of hidden_names) {
            if (name == myname) continue;
            while(content.indexOf(name) != -1) content = _.replace(content, name, name[0] + '**');
        }
        return content;
    }
    ctx.state.ip = ctx.headers['x-real-ip'] || ctx.ip;
    await next();
});

app.use(async (ctx, next) => {
    ctx.state.current_page = "404";
    ctx.state.user = null;
    ctx.state.title = "404";
    await next();
});

let router = new Router();

router.use(require('koa-logger')());
router.use(flash);
router.use(auth.visit);
router.use(auth.userM);
router.use(async (ctx, next) => {
    let {contest, contest_sign} = await chelper.fetchDefaultContest(ctx);
    ctx.state.latest_contest = contest;
    ctx.state.latest_contest_sign = contest_sign;
    await next();
});

router.use('', require('./controllers/index').routes());
router.use('', require('./controllers/contest').routes());
router.use('', require('./controllers/users').routes());
router.use('', require('./controllers/admin').routes());
router.use('', require('./controllers/oauth').routes());

app.use(router.routes());
app.use(require('koa-static')('public'));
app.use(async (ctx, next) => {
    await ctx.render('404', {layout: false});
});

app.listen(SERVER.PORT, SERVER.ADDRESS);

log.info(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);

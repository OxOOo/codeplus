
let Koa = require('koa');
let Router = require('koa-router');
let mount = require('koa-mount');
let render = require('koa-ejs');
let bodyParser = require('koa-bodyparser');
let session = require('koa-session-minimal')
let redisStore = require('koa-redis');
let path = require('path');
let MarkdownIt = require('markdown-it');
let moment = require('moment');

let config = require('./config');
let { log, SERVER } = require('./config');
let auth = require('./services/auth');
let flash = require('./services/flash');

let app = new Koa();

app.use(require('koa-logger')());
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
app.use(session({
    store: redisStore({
        url: config.REDIS_URL
    })
}));
app.use(async (ctx, next) => {
    ctx.state.md = new MarkdownIt({
        html: true
    });
    ctx.state.md.use(require('markdown-it-katex'));
    ctx.state.moment_format = function(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss UTCZZ');
    }
    ctx.state.moment_parse = function(date) {
        return moment(date, 'YYYY-MM-DD HH:mm:ss UTCZZ').toDate();
    }
    await next();
});

app.use(async (ctx, next) => {
    ctx.state.current_page = "404";
    ctx.state.user = null;
    ctx.state.title = "Code+";
    await next();
});
app.use(flash);
app.use(auth.userM);

let router = new Router();

router.use('', require('./controllers/index').routes());
router.use('', require('./controllers/contest').routes());
router.use('', require('./controllers/users').routes());
router.use('', require('./controllers/admin').routes());

app.use(router.routes());
app.use(require('koa-static')('public'));
app.use(async (ctx, next) => {
    await ctx.render('404');
});

app.listen(SERVER.PORT, SERVER.ADDRESS);

log.info(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);

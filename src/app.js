
let Koa = require('koa');
let mount = require('koa-mount');
let render = require('koa-ejs');
let bodyParser = require('koa-bodyparser');
let session = require('koa-session-minimal')
let redisStore = require('koa-redis');
let path = require('path');
let MarkdownIt = require('markdown-it');

let config = require('./config');
let { log, SERVER } = require('./config');
let auth = require('./services/auth');
let flash = require('./services/flash');

let app = new Koa();

app.use(require('koa-logger')());
app.use(bodyParser());
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
    await next();
});

app.use(flash);
app.use(auth.userM);

app.use(require('./controllers/index').routes());
app.use(require('./controllers/contest').routes());
app.use(require('./controllers/users').routes());
app.use(require('koa-static')('public'));
app.use(async (ctx, next) => {
    await ctx.render('404', {layout: false});
});

app.listen(SERVER.PORT, SERVER.ADDRESS);

log.info(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);
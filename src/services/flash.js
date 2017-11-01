
let _ = require('lodash');
let utils = require('utility');

const key = 'website_flash';

/// flash中间件
/// 可以使用ctx.state.flash添加flash变量
module.exports = async function (ctx, next) {
    ctx.flash = ctx.session[key] || {};
    delete ctx.session[key];

    Object.defineProperty(ctx.state, 'flash', {
        enumerable: true,
        get: function () {
            return ctx.flash;
        },
        set: function (val) {
            if (utils.md5(val) != utils.md5(ctx.flash)) {
                ctx.session[key] = val;
                ctx.flash = val;
            }
        }
    });

    await next();

    if (String(ctx.status).startsWith('30') && ctx.session && !(ctx.session[key])) {
        ctx.session[key] = ctx.flash;
    }
}
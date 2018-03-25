
// 守护

let { Count, User, Contest, ContestSign } = require('./models');
let { log } = require('./config');
let chelper = require('./services/chelper');

let { EMailToSend, EMailBlacklist } = require('./models');

let juice = require('juice');
let h2t = require('html-to-text');
let email = require("emailjs/email");
let util = require('util');
let tools = require('./services/tools');
let email_srv = require('./services/email');
let config = require('./config');

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    })
}

// 统计各种数量
async function Counter() {
    log.info('running Counter()');

    let users_count = await User.count();
    await Count.create({name: 'users', value: users_count});

    for(let contest of await Contest.find()) {
        if (contest.begin_sign_time <= Date.now() && Date.now() <= contest.end_sign_time) {
            for(let type of contest.contests) {
                let count = await ContestSign.find({contestID: contest._id, type: type}).count();
                await Count.create({name: `contest_${type}_signs:${contest._id}`, value: count});
            }
        }
    }
}

// 发送邮件
let server 	= email.server.connect({
    user: config.EMAIL.USER,
    password: config.EMAIL.PASSWORD, 
    host: config.EMAIL.HOST, 
    ssl: config.EMAIL.SSL
});
let sending = false;
async function SendEMail() {
    if (sending) return;

    sending = true;
    try {
        log.info('running SendEMail()');

        while(true)
        {
            let task = await EMailToSend.findOne({has_sent: false}).sort('-priority');
            if (!task) break;
            if (task.priority <= 10) await sleep(3000);

            task.has_sent = true;
            task.send_api = 'SMTPv2';
            task.sent_at = new Date();

            let mailHtml = null;
            try {
                mailHtml = await email_srv.renderEmailTask(task);
                task.render_msg = 'success';
            } catch(e) {
                task.render_msg = e.message;
                await task.save();
                continue;
            }
            
            let send = util.promisify(server.send).bind(server);
            task.info_msg = null;
            task.error_msg = null;
            try {
                if (task.priority <= 0 && await EMailBlacklist.findOne({email: task.to})) {
                    throw new Error('[blacklist]receiver address in blacklist');
                }
                task.info_msg = JSON.stringify(await send({
                    text: h2t.fromString(mailHtml, { wordwrap: 80 }),
                    from: `Code+ <${config.EMAIL.USER}>`,
                    to: `${tools.emailName(task.to)} <${task.to}>`,
                    subject: task.subject,
                    attachment: [
                        { data: juice(mailHtml), alternative: true },
                    ],
                }));
            } catch(e) {
                task.error_msg = e.message;
            }

            await task.save();
        }
    } catch(e) {
        sending = false;
        throw e;
    }
    sending = false;
}

async function run(func) {
    try {
        await func();
    } catch(e) {
        console.error(e);
    }
}

setInterval(run, 1000 * 60, Counter); // 每分钟记录一次

setInterval(run, 1000, SendEMail); // 每1s检查一次


// 守护

let { Count, User, Contest, ContestSign } = require('./models');
let { log } = require('./config');
let chelper = require('./services/chelper');

// 统计各种数量
async function Counter() {
    log.info('running Counter()');

    let users_count = await User.count();
    await Count.create({name: 'users', value: users_count});

    for(let contest of await Contest.find()) {
        if (contest.begin_sign_time <= Date.now() && Date.now() <= contest.end_sign_time) {
            for(let type of ['div1', 'div2']) {
                let count = await ContestSign.find({contestID: contest._id, type: type}).count();
                await Count.create({name: `contest_${type}_signs:${contest._id}`, value: count});
            }
        }
    }
}

async function run(func) {
    try {
        await func();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

setInterval(run, 1000 * 60, Counter); // 每分钟记录一次
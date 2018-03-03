// 提取用户<临时代码提交>页面的代码


let mzfs = require('mz/fs');
let _ = require('lodash');
let assert = require('assert');
let moment = require('moment');
let utils = require('utility');
let { Contest, ContestSign, User, NormalLogin } = require('./src/models');

async function main() {
    let contest = await Contest.findOne();
    console.log(contest.title);
    let date = moment('2017-11-25 17:00');
    assert(date.format('ZZ') == '+0800');

    for(let type of ['div1', 'div2']) {
        let names = [];
        for(let i = 1; i <= 6; i ++) {
            if (type == 'div1' && i <= 2) continue;
            if (type == 'div2' && i >= 5) continue;
            names.push(`T${i}_code`);
        }
        console.log(names);

        let signs = await ContestSign.find({contestID: contest._id, type: type});
        console.log(type, 'total signs:', signs.length);
        let submits = [];

        for(let s of signs) {
            let user = await User.findById(s.userID);
            let login = await NormalLogin.findOne({userID: user._id});
            for(let i = 0; i < 4; i ++) {
                let name = names[i];
                // console.log(user[name]);

                if (user[name] && user[name].length > 0) {
                    submits.push({
                        username: login.oj_username,
                        submit_time: date.unix(),
                        code: utils.base64encode(user[name]),
                        contest: type,
                        problem: i
                    });
                }
            }
        }
        console.log(submits.length);

        await mzfs.writeFile(type + '.json', JSON.stringify(submits), 'utf-8');
    }
}

async function run() {
    try {
        await main();
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

run();

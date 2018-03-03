// 读取pass.txt文件,用没一个帐号登录OJ,刷新用户的比赛列表
// pass.txt每行一个帐号,[username password], password是加盐之后的数据

let mzfs = require('mz/fs');
let agent = require('superagent');
let async = require('async');
let util = require('util');

async function main() {
    let content = await mzfs.readFile('pass.txt', 'utf-8');
    let lines = content.split('\n');

    let filtered = lines.slice();

    let run = util.promisify(async.eachLimit).bind(async);

    await run(lines, 10, async function(line) {
        let username = line.split(' ')[0];
        let password = line.split(' ')[1];
        let request = agent.agent();

        let step1 = await request.post('https://cp.thusaac.org/salt_login').type('form').send({username, password});

        let step2 = await request.get('https://cp.thusaac.org/oauth/authorize?app_id=wk635xuxdgj1ijiwupsroxaiz9okecbv&redirect_uri=https%3A%2F%2Foj.thusaac.org%2Fapi%2Fuser%2Fcodeplus_login');

        let step3 = await request.post('https://oj.thusaac.org/api/user/lookup');

        filtered = filtered.filter(x => x != line);
        mzfs.writeFileSync('pass.txt', filtered.join('\n'));
        console.log(username, filtered.length + '/' + lines.length);
    });
}

async function run() {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
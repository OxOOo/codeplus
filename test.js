
let mzfs = require('mz/fs');
let { Contest } = require('./src/models');

async function main() {
    const title = "Code+第一次网络赛";
    console.log(title);

    let contest = await Contest.findOne();
    if (!contest) {
        contest = new Contest();
    }
    contest.title = title;
    contest.description = await mzfs.readFile('test.md', 'utf-8');
    contest.terms = await mzfs.readFile('terms.md', 'utf-8');
    contest.public = true;
    contest.begin_sign_time = "2017-11-18 00:00+800";
    contest.end_sign_time = "2017-11-25 13:00+800";
    contest.begin_contest_time = "2017-11-25 14:00+800";
    contest.end_contest_time = "2017-11-25 17:00+800";
    await contest.save();
    console.log('success save');
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

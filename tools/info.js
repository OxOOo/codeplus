
let _ = require('lodash');
let mzfs = require('mz/fs');
let assert = require('assert');
let { Contest, ContestSign, User, NormalLogin } = require('./src/models');

async function solveRanks(type) {
    const input_file = type + '_rank.txt';

    let lines = _.trim(await mzfs.readFile(input_file, 'utf-8')).split('\n');
    lines = lines.map(x => {return _.trim(x);});

    let userID2rank = {};
    let ranklist = [];

    for(let i = 0; i < lines.length; i ++) {
        let tokens = _.split(lines[i], /\s+/);
        if (!tokens[1].startsWith('code+_')) continue;
        if (tokens.length == 9)
        {
            tokens.splice(2, 0, tokens[1].substr(6));
            console.log(tokens[1], tokens[2]);
        }
        if (tokens.length != 10)
        {
            throw new Error(`error at line ${i+1}`);
        }
        let login = await NormalLogin.findOne({username: tokens[2]});
        assert(login);
        let user = await User.findById(login.userID);
        assert(user);
        tokens.splice(3, 0, user.school);

        userID2rank[String(login.userID)] = Number(tokens[0]);
        ranklist.push({
            rank: Number(tokens[0]),
            userID: String(login.userID)
        });
    }

    return {userID2rank, ranklist};
}

async function main() {
    let contest = await Contest.findOne({no: 1});
    console.log(contest.title);

    console.log('total sing num:', await ContestSign.find({contestID: contest._id}).count());
    console.log('total user num:', await User.find().count());
    console.log('div1 num:', await ContestSign.find({contestID: contest._id, type: 'div1'}).count());
    console.log('div2 num:', await ContestSign.find({contestID: contest._id, type: 'div2'}).count());

    let ranks = {};
    for(let type of ['div1', 'div2']) {
        ranks[type] = await solveRanks(type);
    }

    let fd = await mzfs.open('user_info.csv', 'w');
    await mzfs.write(fd, "姓名,学校,性别,电话号码,邮箱,联系地址,衣服尺寸,报名比赛,比赛名次\n");
    for(let sign of await ContestSign.find({contestID: contest._id})) {
        let user = await User.findById(sign.userID);
        await mzfs.write(fd, `${user.real_name},${user.school},${user.sex},${user.phone_number},${user.email},${user.address},${user.tshirt_size}`);
        await mzfs.write(fd, `,${sign.type}`);
        let r = ranks[sign.type].userID2rank[String(user._id)];
        if (r) await mzfs.write(fd, `,${r}`);
        else await mzfs.write(fd, `, `);
        await mzfs.write(fd, '\n');
    }
    await mzfs.close(fd);

    for(let type of ['div1', 'div2']) {
        let fd = await mzfs.open(`user_${type}.csv`, 'w');
        await mzfs.write(fd, "排名,姓名,学校\n");
        let ranklist = ranks[type].ranklist;
        for(let x of ranklist) {
            let r = x.rank;
            let user = await User.findById(x.userID);
            await mzfs.write(fd, `${r},${user.real_name},${user.school}\n`);
        }
        await mzfs.close(fd);
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

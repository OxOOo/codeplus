// 输入排名表
// 输出有学校的排名
// 输出幸运将

let _ = require('lodash');
let mzfs = require('mz/fs');
let assert = require('assert');
let { Contest, ContestSign, User, NormalLogin } = require('../src/models');

async function solve(type) {
    let contest = await Contest.findOne({no: 3});
    console.log(contest.title);

    const input_file = type + '_rank.txt';
    const output_file = type + '_rank_with_school.txt';
    const random_file = type + '_rank_random.txt';

    let lines = _.trim(await mzfs.readFile(input_file, 'utf-8')).split('\n');
    console.log(lines.length);
    lines = lines.map(x => {return _.trim(x);});
    let outputs = [];

    let random_users = [];

    for(let i = 0; i < lines.length; i ++) {
        let tokens = _.split(lines[i], /\s+/);
        if (!tokens[1].startsWith('code+_')) continue;
        if (tokens.length != 10)
        {
            throw new Error(`error at line ${i+1}`);
        }
        let rank = Number(tokens[0]);
        let score = Number(tokens[5]);
        let login = await NormalLogin.findOne({username: tokens[2]});
        assert(login);
        let sign = await ContestSign.findOne({contestID: contest._id, userID: login.userID});
        assert(sign && sign.type == type);
        let user = await User.findById(login.userID);
        assert(user);
        tokens.splice(3, 0, _.trim(user.school).length > 0 ? user.school : '火星学院');
        outputs.push(tokens);

        if (rank > 30)
        {
            random_users.push({
                username: login.username,
                score: score
            });
        }
    }

    let max_value = 0;
    for(let u of random_users)
    {
        u.range_start = max_value;
        max_value += u.score;
        u.range_end = max_value;
    }
    let randomed = [];
    for(let i = 0; i < 20; i ++)
    {
        while(true)
        {
            let x = Math.random() * max_value;
            let u = null;
            for(let y of random_users)
            {
                if (y.range_start <= x && x < y.range_end) u = y;
            }
            assert(u != null);
            if (u.username in randomed) continue;
            randomed.push(u.username);
            break;
        }
    }
    
    console.log(contest.title);

    await mzfs.writeFile(output_file, outputs.map(x => {return x.join('\t')}).join('\n'));
    await mzfs.writeFile(random_file, randomed.join('\n'));
}

async function run() {
    try {
        await solve('div1');
        await solve('div2');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

run();


let _ = require('lodash');
let mzfs = require('mz/fs');
let assert = require('assert');
let { Contest, ContestSign, User, NormalLogin } = require('./src/models');

async function solve(type) {
    const input_file = type + '_rank.txt';
    const output_file = type + '_rank_with_school.txt';

    let lines = _.trim(await mzfs.readFile(input_file, 'utf-8')).split('\n');
    console.log(lines.length);
    lines = lines.map(x => {return _.trim(x);});
    let outputs = [];
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
        outputs.push(tokens);
    }

    await mzfs.writeFile(output_file, outputs.map(x => {return x.join('\t')}).join('\n'));
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

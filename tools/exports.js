
let mzfs = require('mz/fs');
let _ = require('lodash');
let assert = require('assert');
let { Contest, ContestSign, User, NormalLogin } = require('./src/models');

async function main() {
    let contest = await Contest.findOne();
    console.log(contest.title);

    for(let type of ['div1', 'div2']) {
        let signs = await ContestSign.find({contestID: contest._id, type: type});
        console.log(type, 'total signs:', signs.length);
        let fd = await mzfs.open(type + '.txt', 'w');
        let fd_userlist = await mzfs.open(type + '_userlist.txt', 'w');
        await mzfs.write(fd, 'realname\tschool\tusername\tpassword\n');
        for(let s of signs)
        {
            let user = await User.findById(s.userID);
            let login = await NormalLogin.findOne({userID: user._id});
            await mzfs.write(fd, `${login.username}\t${user.school}\t${login.oj_username}\t${login.oj_password}\n`);
            await mzfs.write(fd_userlist, login.oj_username + '\n');
        }
        await mzfs.close(fd);
        await mzfs.close(fd_userlist);

        // check
        let content = await mzfs.readFile(type + '.txt', 'utf-8');
        assert(content.length > 0);
        let lines = _.trim(content).split('\n');
        assert(lines.length > 0);
        for(let line of lines)
        {
            let tokens = line.split('\t');
            assert(tokens.length == 4);
            for(let token of tokens)
            {
                assert(token.length > 0);
            }
        }
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

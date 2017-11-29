
let mzfs = require('mz/fs');
let { Contest, ContestSign, User } = require('./src/models');

async function main() {
    let nickname1 = process.argv[2];
    let nickname2 = process.argv[3];
    let user = await User.findOne({nickname: nickname1});
    user.nickname = nickname2;
    await user.save();
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

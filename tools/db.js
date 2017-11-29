
let mzfs = require('mz/fs');
let { Contest, ContestSign, User } = require('./src/models');

async function main() {
    console.log('total sing num:', await ContestSign.find().count());
    console.log('total user num:', await User.find().count());
    console.log('div1 num:', await ContestSign.find({type: 'div1'}).count());
    console.log('div2 num:', await ContestSign.find({type: 'div2'}).count());

    let users = await User.find();
    let signs = await ContestSign.find();
    users = users.filter((u) => {
        for(let i = 0; i < signs.length; i ++)
        {
            if (u._id.equals(signs[i].userID)) return false;
        }
        return true;
    });
    users = users.filter((u) => {
        return u.phone_number && !u.email_will && !u.email;
    });
    console.log('info_filled num:', users.length);

    for(let i = 0; i < users.length; i ++)
    {
        console.log(users[i].nickname);
    }
    console.log(users.map((u) => {return u.phone_number;}).join(';'));
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

let _ = require('lodash');
let mzfs = require('mz/fs');
let assert = require('assert');
let { Contest, ContestSign, User, NormalLogin } = require('../src/models');

class Rating {
    constructor(type) {
        assert(type == 'div1' || type == 'div2');
        this.type = type;
        this.rank_txt = type + '_rank.txt';
        this.rating_txt = type + '_rating.txt';
        this.type_idx = type == 'div1' ? 1 : 2;
    }
    async loadRankTXT() {
        const lines = _.trim(await mzfs.readFile(this.rank_txt, 'utf-8')).split('\n');
        return lines.filter(x => _.split(x, /\s+/)[1].startsWith('code+')).map(x => _.split(x, /\s+/));
    }

    async getUserList() {
        return (await this.loadRankTXT()).map(x => x[2]);
    }
    async getTotal() {
        return (await this.loadRankTXT()).filter(x => Number(x[3]) > 0).length;
    }
    async getBeforeRating(username) {
        return 1500;
    }
    async getRank(username) {
        if (!this.ranks) {
            this.ranks = {};
            (await this.loadRankTXT()).forEach(x => {
                this.ranks[x[2]] = Number(x[0]);
            });
        }

        assert(_.keys(this.ranks).includes(username));
        return this.ranks[username];
    }
    async getScore(username) {
        if (!this.scores) {
            this.scores = {};
            (await this.loadRankTXT()).forEach(x => {
                this.scores[x[2]] = Number(x[5]);
            });
        }
    }

    async run() {
        console.log(`running ${this.type} rating`);

        let users = await this.getUserList();
        let deltaS = {};
        let index = (1000 - this.type_idx*250)/(await this.getTotal())/2;
        for(let i = 0; i < users.length; i ++) {
            let userA = users[i];
            let delta = 0;

            for(let j = 0; j < users.length; j ++) {
                if (j == i) continue;

                let userB = users[j];
                
                let rankA = await this.getRank(userA);
                let rankB = await this.getRank(userB);
                let sAB = rankA == rankB ? 0.5 : (rankA < rankB ? 1.0 : 0.0);

                let ratingA = await this.getBeforeRating(userA);
                let ratingB = await this.getBeforeRating(userB);
                let eAB = 1.0 / ( 1.0 + Math.pow(10.0, (ratingB-ratingA)/400.0) );

                delta += index*(sAB - eAB);
            }

            deltaS[userA] = Math.round(delta);
        }

        let contents = [];
        for(let u of users) {
            let before = await this.getBeforeRating(u);
            let delta = deltaS[u];
            let now = before + delta;
            contents.push(u + '\t' + before + '\t' + now + '\t' + delta);
        }
        await mzfs.writeFile(this.rating_txt, contents.join('\n'));
    }
}

async function run() {
    try {
        await (new Rating('div1')).run();
        await (new Rating('div2')).run();
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

run();

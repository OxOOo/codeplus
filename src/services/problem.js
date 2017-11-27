
let { STORAGE } = require('../config');
let { User, Contest, ContestSign } = require('../models');
let path = require('path');
let mzfs = require('mz/fs');

let FetchZIP = exports.FetchZIP = async function(contest) {
    if (contest.repository_local_name && await mzfs.exists(path.join(STORAGE.REPO, contest.repository_local_name))) {
        let contest_path = path.join(STORAGE.REPO, contest.repository_local_name);
        if (await mzfs.exists(path.join(contest_path, 'download.zip'))) {
            return path.join(contest_path, 'download.zip');
        }
    }
    return null;
}

let FetchProblemInfo = exports.FetchProblemInfo = async function (contest, type, idx) {
    let contest_path = path.join(STORAGE.REPO, contest.repository_local_name);
    let root_dir = path.join(contest_path, type);
    let conf = JSON.parse(await mzfs.readFile(path.join(root_dir, 'conf.json'), 'utf-8'));
    let problem_dir = path.join(root_dir, conf['subdir'][idx]);
    let problem_conf = JSON.parse(await mzfs.readFile(path.join(problem_dir, 'conf.json'), 'utf-8'));
    let problem_name = path.basename(problem_dir);
    let problem_title = problem_conf['title']['zh-cn'];
    let problem_content = await mzfs.readFile(path.join(contest_path, 'statements', 'tuoj', type, problem_name + '.md'), 'utf-8');

    let problem_solution = null;
    for(let file of await mzfs.readdir(problem_dir)) {
        if ((await mzfs.stat(path.join(problem_dir, file))).isFile() && file.toLowerCase().startsWith('solution')) {
            problem_solution = path.join(problem_dir, file);
        }
    }
    let problem_link = null;
    try {
        let links = JSON.parse(await mzfs.readFile(path.join(contest_path, 'links.json'), 'utf-8'));
        problem_link = links[problem_name];
    } catch(e){
    }

    return {
        contest_path: contest_path,
        name: problem_name,
        title: problem_title,
        content: problem_content,
        solution: problem_solution,
        link: problem_link
    };
}

let FetchProblems = exports.FetchProblems = async function(contest, type) {
    let contest_path = path.join(STORAGE.REPO, contest.repository_local_name);
    let root_dir = path.join(contest_path, type);
    let conf = JSON.parse(await mzfs.readFile(path.join(root_dir, 'conf.json'), 'utf-8'));
    let problems = [];
    for(let idx in conf['subdir']) {
        problems.push(await FetchProblemInfo(contest, type, idx));
    }
    return problems;
}
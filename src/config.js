
let should = require('should');
let _ = require('lodash');
let yaml = require('js-yaml');
let path = require('path');
let fs = require('fs');
let Log = require('log');

let config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config.yml'), 'utf-8'));

let log = exports.log = new Log('info');

let SERVER = exports.SERVER = _.pick(config['SERVER'], ['ADDRESS', 'PORT', 'URL_PREFIX']);

// 数据库相关
if ('MONGO_HOST' in process.env && 'REDIS_HOST' in process.env) { // for docker
	exports.REDIS_URL = `redis://${process.env['REDIS_HOST']}:${config['REDIS']['PORT']}`;
	exports.MONGODB_URL = `mongodb://${process.env['MONGO_HOST']}/${config['MONGODB']['DATABASE']}`;
} else {
	exports.REDIS_URL = `redis://${config['REDIS']['HOSTNAME']}:${config['REDIS']['PORT']}`;
	exports.MONGODB_URL = `mongodb://${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
}

// EMAIL
const EMAIL = exports.EMAIL = _.pick(config['EMAIL'], 'USER', 'PASSWORD', 'HOST', 'SSL');

// OAUTH
const OAUTH = exports.OAUTH = _.pick(config['OAUTH'], 'GITHUB');

const SUPPORT = exports.SUPPORT = config['SUPPORT'];

const STORAGE = exports.STORAGE = config['STORAGE'];

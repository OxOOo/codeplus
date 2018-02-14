
let should = require('should');
let _ = require('lodash');
let yaml = require('js-yaml');
let path = require('path');
let fs = require('fs');
let Log = require('log');

let config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config.yml'), 'utf-8'));

let log = exports.log = new Log('info');

let SERVER = exports.SERVER = _.pick(config['SERVER'], ['ADDRESS', 'PORT', 'URL_PREFIX', 'SECRET_KEYS']);

// 数据库相关
if ('MONGO_HOST' in process.env) { // for docker
	exports.MONGODB_URL = `mongodb://${process.env['MONGO_HOST']}/${config['MONGODB']['DATABASE']}`;
} else {
	exports.MONGODB_URL = `mongodb://${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
}

// EMAIL
const EMAIL = exports.EMAIL = _.pick(config['EMAIL'], 'USER', 'PASSWORD', 'HOST', 'SSL');

// OAUTH
const OAUTH = exports.OAUTH = _.pick(config['OAUTH'], 'GITHUB');

const SUPPORT = exports.SUPPORT = config['SUPPORT'];

const STORAGE = exports.STORAGE = config['STORAGE'];

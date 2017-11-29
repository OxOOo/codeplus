
let _ = require('lodash');
require('should');

let auth = require('./auth');

let email_reg = /^(.*)@([^@]+\.\w+)$/;

exports.emailFormatCheck = async (email) => {
    auth.assert(email_reg.exec(email), '邮件格式不正确');
}

exports.emailName = (email) => {
    auth.assert(email_reg.exec(email), '邮件格式不正确');
    return email_reg.exec(email)[1];
}

exports.bindFindByXX = (objs, XX) => {
    objs.should.be.instanceOf(Array);
    XX.should.be.a.String();

    const index_name = `${XX}_indxes`;
    const func_name = `findBy${XX}`;

    objs[index_name] = {};
    objs.forEach(x => {
        objs[index_name][String(x[XX])] = x;
    });

    objs[func_name] = (id) => {
        id = String(id);
        if (id in objs[index_name]) return objs[index_name][id];
        else return null;
    }
}

exports.buildBinarySearch = (items) => {
    items._items_index = _.clone(items);
    items._items_index.sort();
    items.binarySearch = (v) => {
        return _.sortedIndexOf(items._items_index, v) != -1;
    }
}
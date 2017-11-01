
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

exports.buildFindById = (objs) => {
    objs.should.be.instanceOf(Array);

    objs._id_index = {};
    objs.forEach(x => {
        objs._id_index[String(x._id)] = x;
    });

    objs.findById = (id) => {
        id = String(id);
        if (id in objs._id_index) return objs._id_index[id];
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
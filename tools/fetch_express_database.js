// 下载快递信息数据库（顺丰的数据库）

let _ = require('lodash');
let request = require('superagent');
let qs = require('querystring');
let { MDB } = require('../src/models');

async function main() {
    let provinces = [];
    let cities = [];
    let area = [];

    let data;
    data = (await request.get('https://i.sf-express.com/service/address/data/province/CN/sc')).body;

    for(let x of data.hotCityData) {
        provinces.push({
            name: x.parentId.substr(x.parentId.indexOf('/') + 1),
            id: x.parentId.substr(0, x.parentId.indexOf('/')),
            parentId: null,
            level: 'province'
        });
    }
    for(let x of data.provinceData) {
        provinces.push({
            name: x.name,
            id: x.id,
            parentId: null,
            level: 'province'
        });
    }
    provinces = _.uniqBy(provinces, x => x.name);
    console.log('省', provinces.length);
    console.log(provinces);

    let p_count = 0;
    for(let p of provinces) {
        data = (await request.get('https://i.sf-express.com/service/address/data/city/CN/sc').query({parentId: p.id + '/' + p.name})).body;
        p_count ++;
        console.log('p_count:', p_count, '/', provinces.length);
        for(let x of data.cityData) {
            cities.push({
                name: x.name,
                id: x.id,
                parentId: p.id,
                level: 'city'
            });
        }
    }
    console.log('市', cities.length);
    console.log(cities);

    let c_count = 0;
    for(let c of cities) {
        let url = 'https://i.sf-express.com/service/address/data/area/CN/sc?parentId=' + qs.escape(c.id + '/'+qs.escape(c.name));
        data = (await request.get(url)).body;
        c_count ++;
        console.log('c_count:', c_count, '/', cities.length);
        for(let x of data.areaData) {
            area.push({
                name: x.name,
                id: x.id,
                parentId: c.id,
                level: 'area'
            });
        }
    }
    console.log('县/区', area.length);
    console.log(area);

    provinces.push({
        name: '港澳台',
        id: '000',
        parentId: null,
        level: 'province'
    });
    cities.push({
        name: '此地区暂不支持发送快递，请联系管理员',
        id: '0000',
        parentId: '000',
        level: 'city'
    });
    area.push({
        name: '此地区暂不支持发送快递，请联系管理员',
        id: '00000',
        parentId: '0000',
        level: 'area'
    });

    await MDB.remove({});
    await MDB.insertMany(provinces);
    await MDB.insertMany(cities);
    await MDB.insertMany(area);
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
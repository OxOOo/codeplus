
let mongoose = require('mongoose');
let _ = require('lodash');

// 地图数据库
let mdbSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true,
	},
	id: {
		type: String,
		required: true,
	},
	parentId: {
		type: String,
	},
	level: {
		type: String, // province/city/area
		required: true,
	}

});

module.exports = mongoose.model("mdb", mdbSchema);

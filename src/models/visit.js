
let mongoose = require('mongoose');
let _ = require('lodash');

// 访问记录
let visitSchema = new mongoose.Schema({

	url: {
		type: String,
		required: true
	},

	ip: String,

	method: String,

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Visit", visitSchema);

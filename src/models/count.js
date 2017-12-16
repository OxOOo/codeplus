
let mongoose = require('mongoose');
let _ = require('lodash');

// 计数
let countSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},

	value: {
		type: Number,
		required: true
	},

	recorded_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Count", countSchema);

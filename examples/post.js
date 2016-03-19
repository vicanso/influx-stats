'use strict';
const request = require('superagent');
const _ = require('lodash');


function random() {
	return {
		code: _.random(0, 599),
		bytes: _.random(0, 100 * 1024),
		use: _.random(0, 5000),
		method: _.sample(['GET', 'POST', 'PUT', 'DELETE', 'HEAD'])
	};
}


function writePoint() {
	const fields = random();
	const tags = {
		method: fields.method,
		status: fields.code / 100 | 0,
		spdy: _.sortedIndex([30, 300, 1000, 3000], fields.use),
		size: _.sortedIndex([1024, 5 * 1024, 15 * 1024, 50 * 1024], fields.bytes)
	};
	delete fields.method;
	const data = {
		measurement: 'http',
		tags: tags,
		fields: fields
	};

	request.post('http://jenny.f3322.net:2000/influxdb-collector/add-points/albi')
		.type('json')
		.send(data)
		.end((err, res) => {
			if (err) {
				console.error(err);
			}
		});
}

setInterval(writePoint, 100);


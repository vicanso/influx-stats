'use strict';
const _ = require('lodash');
const stats = localRequire('helpers/stats');

module.exports = (ctx) => {
	const app = ctx.params.app;
	const data = getData(ctx.method, ctx);
	_.forEach(data, item => {
		if (item.measurement && item.fields) {
			stats.write(app, item.measurement, item.fields, item.tags, item.time);
		}
	});
	ctx.status = 201;
};


function getMeasurement(str) {
	const reg = /measurement\((\S+?)\)/;
	const result = _.get(reg.exec(str), '[1]');
	return result;
}


function getTags(str) {
	const reg = /tags\((\S+?)\)/;
	const result = _.get(reg.exec(str), '[1]');
	if (!result) {
		return;
	}
	const tags = {};
	_.forEach(result.split(','), tmp => {
		const arr = tmp.split('|');
		tags[arr[0]] = arr[1];
	});
	return tags;
}

function getTime(str) {
	const reg = /time\((\S+?)\)/;
	const result = _.get(reg.exec(str), '[1]');
	return result;
}

function getFields(str) {
	const reg = /fields\((\S+?)\)/;
	const result = _.get(reg.exec(str), '[1]');
	if (!result) {
		return;
	}
	const fields = {};
	_.forEach(result.split(','), tmp => {
		const arr = tmp.split('|');
		fields[arr[0]] = parseFloat(arr[1]);
	});
	return fields;
}


function getData(method, ctx) {
	if (method === 'POST') {
		const data = ctx.request.body;
		return _.isArray(data)? data : [data];
	} else {
		let points = ctx.query.point;
		if (!_.isArray(points)) {
			points = [points];
		}
		const data = [];
		_.forEach(points, point => {
			const measurement = getMeasurement(point);
			const fields = getFields(point);

			if (!measurement || !fields) {
				return;
			}
			const tmp = {
				measurement: measurement,
				fields: fields
			};

			const tags = getTags(point);
			if (tags) {
				tmp.tags = tags;
			}

			const time = getTime(point);
			if (time) {
				tmp.time = time;
			}

			data.push(tmp);
		});
		return data;
	}
}
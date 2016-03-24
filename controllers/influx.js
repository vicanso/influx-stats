'use strict';
const _ = require('lodash');
const stats = localRequire('helpers/stats');
const debug = localRequire('helpers/debug');

module.exports = (ctx) => {
	const app = ctx.params.app;
	const data = getData(ctx.method, ctx);
	_.forEach(data, item => {
		if (item.m && item.f) {
			debug('stats write, app:%s, data:%j', app, item);
			// 时间设置的是ms，补6个位
			if (item.time && item.time.length === 13) {
				item.time += _.random(100000, 999999);
			}
			stats.write(app, item.m, item.f, item.t, item.time);
		}
	});
	ctx.status = 201;
};


function getMeasurement(str) {
	const reg = /m\((\S+?)\)/;
	const result = _.get(reg.exec(str), '[1]');
	return result;
}


function getTags(str) {
	const reg = /t\((\S+?)\)/;
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
	const reg = /f\((\S+?)\)/;
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
				m: measurement,
				f: fields
			};

			const tags = getTags(point);
			if (tags) {
				tmp.t = tags;
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
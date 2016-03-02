'use strict';
const _ = require('lodash');
const stats = localRequire('helpers/stats');

module.exports = (ctx) => {
	const app = ctx.params.app;
	const data = getData(ctx.method, ctx);
	_.forEach(data, item => {
		stats.write(app, item.series, item.tags, item.values);
	});
	ctx.body = null;
};


function getData(method, ctx) {
	if (method === 'POST') {
		const data = ctx.request.body;
		return _.isArray(data)? data : [data];
	} else {
		let points = ctx.query.point;
		if (!_.isArray(points)) {
			points = [points];
		}
		const getSeries = (str) => {
			const reg = /series\((\S+?)\)/
			const result = _.get(reg.exec(str), '[1]');
			return result;
		};

		const getTags = (str) => {
			const reg = /tags\((\S+?)\)/
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
		};

		const getValues = (str) => {
			const reg = /values\((\S+?)\)/
			const result = _.get(reg.exec(str), '[1]');
			if (!result) {
				return;
			}
			const values = {};
			_.forEach(result.split(','), tmp => {
				const arr = tmp.split('|');
				values[arr[0]] = parseFloat(arr[1]);
			});
			return values;
		};


		const data = [];
		_.forEach(points, point => {
			const series = getSeries(point);
			const tags = getTags(point);

			if (!series || !tags) {
				return;
			}
			const tmp = {
				series: series,
				tags: tags
			};

			const values = getValues(point);
			if (values) {
				tmp.values = values;
			}
			data.push(tmp);
		});
		return data;
	}
}
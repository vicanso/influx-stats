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
		const query = ctx.query;
		const series = query.series;
		const tags = _.get(ctx, 'query.tags');
		const values = _.get(ctx, 'query.values');

		if (!series || !tags || !values) {
			return;
		}
		const data = {
			series: series,
			tags: {},
			values: {}
		};
		_.forEach(tags.split('||'), tmp => {
			const arr = tmp.split('|');
			data.tags[arr[0]] = arr[1];
		});

		_.forEach(values.split('||'), tmp => {
			const arr = tmp.split('|');
			data.values[arr[0]] = parseInt(arr[1]);
		});
		return [data];
	}
}
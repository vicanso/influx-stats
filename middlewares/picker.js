'use strict';
const _ = require('lodash');

module.exports = picker;

/**
 * [picker description]
 * @param  {[type]} field [description]
 * @return {[type]}       [description]
 */
function picker(field) {
	return (ctx, next) => {
		const query = ctx.query;
		let pickValue = query[field];
		if (pickValue) {
			// 将query参数删除，避免影响后面函数的参数判断（请求的参数判断都尽量使用强制匹配，因为参数多一个也不行）
			delete query[field];
			ctx.query = query;
		}
		return next().then(() => {
			/* istanbul ignore if */
			if (!pickValue || !ctx.body) {
				return;
			}
			let pickFn = _.pick;
			if (pickValue[0] === '-') {
				pickFn = _.omit;
				pickValue = pickValue.substring(1);
			}
			const keys = pickValue.split(',');
			const fn = (item) => {
				return pickFn(item, keys);
			};
			if (_.isArray(ctx.body)) {
				ctx.body = _.map(ctx.body, fn);
			} else {
				ctx.body = fn(ctx.body);
			}
		});
	};
}
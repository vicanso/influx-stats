'use strict';
const _ = require('lodash');
const router = require('koa-router-parser');
const controllers = localRequire('controllers');
const middlewares = localRequire('middlewares');
const config = localRequire('config');
const stats = localRequire('helpers/stats');

// add route handler stats，common is for all http method
router.addDefault('common', routeStats);

addToRouter('c', controllers);

addToRouter('m.auth.admin', middlewares.auth.admin);


module.exports = getRouter(localRequire('router/config'));


/**
 * [routeStats description]
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function routeStats(ctx, next) {
	const method = ctx.method.toUpperCase();
	const layer = _.get(ctx, 'matched[0]');
	stats.write(config.app, 'http-route', {
		matched: ctx.matched.length
	}, {
		inst: config.instance,
		method: method,
		route: layer.path
	});
	return next();
}

/**
 * [addToRouter description]
 * @param {[type]} category [description]
 * @param {[type]} fns      [description]
 */
function addToRouter(category, fns) {
	if (_.isFunction(fns)) {
		router.add(category, fns);
		return;
	}
	_.forEach(fns, (v, k) => {
		/* istanbul ignore else */
		if (_.isFunction(v)) {
			router.add(category + '.' + k, v);
		} else if (_.isObject(v)) {
			addToRouter(category + '.' + k, v);
		} else {
			console.error(category + '.' + k + ' is invalid.');
		}
	});
}

/**
 * [getRouter description]
 * @param  {[type]} descList [description]
 * @return {[type]}          [description]
 */
function getRouter(descList) {
	return router.parse(descList);
}
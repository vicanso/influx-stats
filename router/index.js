'use strict';
const _ = require('lodash');
const router = require('koa-router-parser');
const controllers = localRequire('controllers');
const middlewares = localRequire('middlewares');
const config = localRequire('config');
const stats = localRequire('helpers/stats');

/**
 * [routeStats description]
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function routeStats(ctx, next) {
  const startedAt = Date.now();
  return next().then(() => {
    const method = ctx.method.toUpperCase();
    const use = Date.now() - startedAt;
    stats.write(config.app, 'http-route', {
      use,
    }, {
      inst: config.instance,
      method,
      spdy: _.sortedIndex([10, 30, 100], use),
      route: _.get(ctx, 'matched[0].path', 'unknown'),
    });
  });
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
    const key = `${category}.${k}`;
    /* istanbul ignore else */
    if (_.isFunction(v)) {
      router.add(key, v);
    } else if (_.isObject(v)) {
      addToRouter(key, v);
    } else {
      console.error('${key} is invalid');
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


// add route handler stats，common is for all http method
router.addDefault('common', routeStats);

addToRouter('c', controllers);

addToRouter('m.auth.admin', middlewares.auth.admin);

module.exports = getRouter(localRequire('router/config'));

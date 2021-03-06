'use strict';
const stats = localRequire('helpers/stats');
const _ = require('lodash');
const config = localRequire('config');

/**
 * [httpStats 统计http请求数，当前处理数，请求处理时间]
 * @return {[type]}          [description]
 */
function httpStats(options) {
  const tagKeys = 'status spdy size busy'.split(' ');
  return require('koa-http-stats')(options, (performance, statsData) => {
    const tags = _.pick(statsData, tagKeys);
    const fields = _.omit(statsData, tagKeys);
    tags.inst = config.instance;
    stats.write(config.app, 'http', fields, tags);
  });
}

module.exports = httpStats;

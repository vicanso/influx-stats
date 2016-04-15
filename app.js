'use strict';
require('./init');
const _ = require('lodash');
const config = localRequire('config');
const middlewares = localRequire('middlewares');

function initServer(port) {
  localRequire('tasks');
  const Koa = require('koa');
  const mount = require('koa-mounting');
  const app = new Koa();

  // trust proxy
  app.proxy = true;

  app.keys = ['I am tree xie', 'My account is vicanso'];

  // error handler
  app.use(middlewares.error);

  app.use(middlewares.entry(config.appUrlPrefix, config.instance));

  // ping for health check
  app.use(mount('/ping', middlewares.ping));

  // http log
  const koaLog = require('koa-log');
  app.use(koaLog(config.logType));

  // http stats middleware
  app.use(middlewares['http-stats']());

  // http connection limit
  app.use(middlewares.limit(config.limitOptions, config.limitResetInterval));

  app.use(require('koa-methodoverride')());

  app.use(require('koa-bodyparser')());

  app.use(localRequire('router').routes());

  app.on('error', _.noop);

  return app.listen(port, err => {
    if (err) {
      console.error(`server listen on ${port} fail, err:${err.message}`);
    } else {
      console.info(`server listen on ${port}`);
    }
  });
}

/* istanbul ignore if */
if (require.main === module) {
  initServer(config.port);
}

exports.initServer = initServer;

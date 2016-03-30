'use strict';
const bluebird = require('bluebird');
const path = require('path');
const config = localRequire('config');
const fs = bluebird.promisifyAll(require('fs'));
const globals = localRequire('globals');
const _ = require('lodash');
const moment = require('moment');

/**
 * [getVersion description]
 * @return {[type]} [description]
 */
function getVersion() {
  return fs.readFileAsync(path.join(__dirname, '../package.json')).then(buf => {
    const pkg = JSON.parse(buf);
    return {
      code: pkg.appVersion,
      exec: config.version,
    };
  });
}

/**
 * [checkToExit description]
 * @param  {[type]} times [description]
 * @return {[type]}       [description]
 */
/* istanbul ignore next */
function checkToExit(times) {
  if (!times) {
    console.error('exit while there are still connections.');
    process.exit(1);
    return;
  }
  setTimeout(() => {
    const connectingTotal = globals.get('connectingTotal');
    if (!connectingTotal) {
      console.info('exit without any connection.');
      process.exit(0);
      return;
    }
    checkToExit(times - 1);
  }, 10 * 1000).unref();
}

/**
 * [version description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function version(ctx) {
  const cloneCtx = ctx;
  return getVersion().then(data => {
    ctx.set('Cache-Control', 'public, max-age=600');
    cloneCtx.body = data;
  });
}

/**
 * [pause description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function pause(ctx) {
  const cloneCtx = ctx;
  globals.set('status', 'pause');
  console.info(`${config.name} is pause`);
  cloneCtx.body = null;
}

/**
 * [resume description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function resume(ctx) {
  const cloneCtx = ctx;
  globals.set('status', 'running');
  console.info(`${config.name} is resume`);
  cloneCtx.body = null;
}

/**
 * [stats description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function stats(ctx) {
  const cloneCtx = ctx;
  return getVersion().then(v => {
    const uptime = moment(Date.now() - Math.ceil(process.uptime()) * 1000);
    cloneCtx.body = _.extend({
      version: v,
      uptime: uptime.fromNow(),
      startedAt: uptime.toISOString(),
      performance: globals.get('performance'),
    });
  });
}

/**
 * [safeExit description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
/* istanbul ignore next */
function safeExit(ctx) {
  const cloneCtx = ctx;
  globals.set('status', 'pause');
  console.info(`${config.name} will safeExit soon`);
  checkToExit(3);
  cloneCtx.body = null;
}

exports.version = version;
exports.pause = pause;
exports.resume = resume;
exports.stats = stats;
exports.safeExit = safeExit;

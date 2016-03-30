'use strict';
const path = require('path');
const logger = require('timtam-logger');
const config = require('./config');

/**
 * [localRequire 加载本地文件（从app目录相对获取文件）]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function localRequire(name) {
  const file = path.join(__dirname, name);
  return require(file);
}

/**
 * [initLogger description]
 * @return {[type]} [description]
 */
/* istanbul ignore next */
function initLogger() {
  if (!config.log) {
    return;
  }
  logger.set('app', config.app);
  logger.set('extra', {
    process: config.instance,
  });
  logger.wrap(console);
  logger.add(config.log);
}

// 初始化相关信息，程序启动时调用
global.localRequire = localRequire;
initLogger();

/* istanbul ignore next */
process.on('unhandledRejection', err => {
  console.error(`unhandledRejection:${err.message}, stack:${err.stack}`);
});
/* istanbul ignore next */
if (config.env === 'production') {
  process.on('uncaughtException', err => {
    // TODO should safe exit
    console.error(`uncaughtException:${err.message}, stack:${err.stack}`);
  });
}

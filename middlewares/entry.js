'use strict';
const _ = require('lodash');

function entry(appUrlPrefix, processName) {
  return (ctx, next) => {
    const cloneCtx = ctx;
    // 所有的请求都去除appUrlPrefix
    const currentPath = cloneCtx.path;
    if (appUrlPrefix && currentPath.indexOf(appUrlPrefix) === 0) {
      cloneCtx.path = currentPath.substring(appUrlPrefix.length) || '/';
    }
    const val = cloneCtx.get('X-Requested-With') || '';

    if (val.toLowerCase() === 'xmlhttprequest') {
      cloneCtx.xhr = true;
    } else {
      cloneCtx.xhr = false;
    }
    const processList = (cloneCtx.get('Via') || '').split(',');
    processList.push(processName);
    cloneCtx.set('Via', _.compact(processList).join(','));
    cloneCtx.set('Cache-Control', 'no-cache, max-age=0');
    return next();
  };
}

module.exports = entry;

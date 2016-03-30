'use strict';
const _ = require('lodash');
const config = localRequire('config');

function error(ctx, next) {
  const cloneCtx = ctx;
  return next().then(_.noop, (err) => {
    cloneCtx.status = err.status || 500;
    cloneCtx.set('Cache-Control', 'no-cache, max-age=0');
    const data = {
      code: err.code || 0,
      error: err.message,
      expected: false,
    };
    _.forEach(err, (v, k) => {
      data[k] = v;
    });
    if (config.env !== 'production') {
      data.stack = err.stack;
    }
    const str = JSON.stringify(data);
    if (data.expected) {
      console.error(`http-error:${str}`);
    } else {
      console.error(`http-unexpectd-error:${str}`);
    }

    if (cloneCtx.state.TEMPLATE) {
      const htmlArr = ['<html>'];
      /* istanbul ignore else */
      if (config.env !== 'production') {
        htmlArr.push(`<pre>${err.stack}</pre>`);
      } else {
        htmlArr.push(`<pre>${err.message.replace(config.viewPath, '')}</pre>`);
      }
      htmlArr.push('</html>');
      cloneCtx.body = htmlArr.join('');
    } else {
      cloneCtx.body = data;
    }
  });
}

module.exports = error;

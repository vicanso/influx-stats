'use strict';
const globals = localRequire('globals');
const httpError = localRequire('helpers/error');

/**
 * [ping description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function ping(ctx) {
  const cloneCtx = ctx;
  if (globals.get('status') !== 'running') {
    throw httpError('the server is not running now!');
  } else {
    cloneCtx.body = 'pong';
  }
}

module.exports = ping;

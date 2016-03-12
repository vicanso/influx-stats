'use strict';
const globals = localRequire('globals');
const httpError = localRequire('helpers/error');
module.exports = ping;

/**
 * [ping description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function ping(ctx) {
	if (globals.get('status') !== 'running') {
		throw httpError('the server is not running now!');
	} else {
		ctx.body = 'pong';
	}
}
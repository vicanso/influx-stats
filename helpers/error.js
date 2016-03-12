'use strict';
const createError = require('http-errors');

module.exports = error;

/**
 * [error description]
 * @return {[type]} [description]
 */
function error() {
	const err = createError.apply(null, arguments);
	err.expected = true;
	return err;
}
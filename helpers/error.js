'use strict';
const createError = require('http-errors');

/**
 * [error description]
 * @return {[type]} [description]
 */
function error() {
  const err = createError.apply(null, arguments);
  err.expected = true;
  return err;
}

module.exports = error;

'use strict';
const _ = require('lodash');
const globals = {
  status: 'running',
};


/**
 * [get description]
 * @param  {[type]} k [description]
 * @return {[type]}   [description]
 */
function get(k) {
  if (!k) {
    throw new Error('key can not be null');
  }
  return _.get(globals, k);
}

/**
 * [set description]
 * @param {[type]} k [description]
 * @param {[type]} v [description]
 */
function set(k, v) {
  if (!k) {
    throw new Error('key can not be null');
  }
  _.set(globals, k, v);
}

exports.get = get;
exports.set = set;

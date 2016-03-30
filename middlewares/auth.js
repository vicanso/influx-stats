'use strict';
const crypto = require('crypto');
const _ = require('lodash');
const config = localRequire('config');
const error = localRequire('helpers/error');

/**
 * [admin description]
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function admin(ctx, next) {
  const shasum = crypto.createHash('sha1');
  const token = _.get(ctx, 'request.body.jtToken');
  if (token && shasum.update(token).digest('hex') === config.adminToken) {
    return next();
  }

  throw error('token is invalid', 403, {
    type: 'admin-check',
  });
}

exports.admin = admin;

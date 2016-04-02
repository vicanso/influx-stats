'use strict';
const _ = require('lodash');
const config = localRequire('config');
const error = localRequire('helpers/error');
const request = require('superagent');
let influxRules;

function _validate(ctx, rule) {
  let valid = true;
  _.forEach(rule, (v, k) => {
    if (!valid) {
      return;
    }
    const value = ctx.get(k);
    if (v.charAt(0) === '~') {
      const reg = new RegExp(v.substring(1), 'gi');
      valid = reg.test(value);
    } else {
      valid = v === value;
    }
  });
  return valid;
}

function validate(ctx, account, app) {
  if (!influxRules) {
    throw error('rules is not setting', 404);
  }
  const accountRule = influxRules[account];
  if (!accountRule) {
    throw error('account is not setting', 404);
  }
  const rule = accountRule[app];
  if (rule) {
    if (!_validate(ctx, rule)) {
      throw error('token is wrong', 403);
    }
  }
  let valid = true;
  _.forEach(rule, (v, k) => {
    if (!valid) {
      return;
    }
    const value = ctx.get(k);
    if (v.charAt(0) === '~') {
      const reg = new RegExp(v.substring(1), 'gi');
      valid = reg.test(value);
    } else {
      valid = v === value;
    }
  });
  return valid;
}

function getRules(url) {
  const req = request.get(url);
  return new Promise((resolve, reject) => {
    req.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function initRules() {
  if (!config.rules) {
    influxRules = localRequire('rules');
  } else {
    getRules(config.rules).then(res => {
      influxRules = res.body;
      setTimeout(initRules, 60 * 1000).unref();
    }).catch(err => {
      console.error(err);
      setTimeout(initRules, 60 * 1000).unref();
    });
  }
}

initRules();

exports.validate = validate;

'use strict';
const _ = require('lodash');
const config = localRequire('config');
const error = localRequire('helpers/error');
const request = require('superagent');
let influxRules;

function _validate(ctx, headers) {
  let valid = true;
  _.forEach(headers, (v, k) => {
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
  if (!rule) {
    throw error('rule is not set', 400);
  }
  return _validate(ctx, rule.headers);
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

function isLegalMeasurement(account, app, m) {
  const measurement = _.get(influxRules, `${account}.${app}.measurement`);
  if (measurement === '*') {
    return true;
  }
  return !!~_.indexOf(measurement, m);
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
exports.isLegalMeasurement = isLegalMeasurement;

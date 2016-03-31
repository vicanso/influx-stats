'use strict';
const _ = require('lodash');
const stats = localRequire('helpers/stats');
const error = localRequire('helpers/error');
const rules = localRequire('rules');
const config = localRequire('config');

function getMeasurement(str) {
  const reg = /m\((\S+?)\)/;
  const result = _.get(reg.exec(str), '[1]');
  return result;
}

function getTags(str) {
  const reg = /t\((\S+?)\)/;
  const result = _.get(reg.exec(str), '[1]');
  if (!result) {
    return null;
  }
  const tags = {};
  _.forEach(result.split(','), tmp => {
    const arr = tmp.split('|');
    tags[arr[0]] = arr[1];
  });
  return tags;
}

function getTime(str) {
  const reg = /time\((\S+?)\)/;
  return _.get(reg.exec(str), '[1]');
}

function getFields(str) {
  const reg = /f\((\S+?)\)/;
  const result = _.get(reg.exec(str), '[1]');
  if (!result) {
    return null;
  }
  const fields = {};
  _.forEach(result.split(','), tmp => {
    const arr = tmp.split('|');
    fields[arr[0]] = parseFloat(arr[1]);
  });
  return fields;
}

function getData(method, ctx) {
  if (method === 'POST') {
    const data = ctx.request.body;
    return _.isArray(data) ? data : [data];
  }
  let points = ctx.query.point;
  if (!_.isArray(points)) {
    points = [points];
  }
  const data = [];
  _.forEach(points, point => {
    const measurement = getMeasurement(point);
    const fields = getFields(point);

    if (!measurement || !fields) {
      return;
    }
    const tmp = {
      m: measurement,
      f: fields,
    };

    const tags = getTags(point);
    if (tags) {
      tmp.t = tags;
    }

    const time = getTime(point);
    if (time) {
      tmp.time = time;
    }

    data.push(tmp);
  });
  return data;
}


function validate(ctx, rule) {
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

module.exports = (ctx) => {
  const cloneCtx = ctx;
  const account = ctx.params.account;
  const app = ctx.params.app;
  const accountRule = rules[account];
  if (!accountRule) {
    throw error('account is not setting', 400);
  }
  const rule = accountRule[app];
  if (rule) {
    if (!validate(ctx, rule)) {
      throw error('token is wrong', 403);
    }
  }
  const data = getData(ctx.method, ctx);
  let count = 0;
  _.forEach(data, item => {
    const tmp = item;
    if (tmp.m && tmp.f) {
      // 时间设置的是ms，补6个位
      if (tmp.time && tmp.time.length === 13) {
        tmp.time += _.random(100000, 999999);
      }
      stats.write(`${account}-${app}`, tmp.m, tmp.f, tmp.t, tmp.time);
      count++;
    }
  });
  stats.write(config.app, 'write-point', {
    account,
    app,
  }, {
    count,
  });
  cloneCtx.status = 201;
};

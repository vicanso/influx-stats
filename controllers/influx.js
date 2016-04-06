'use strict';
const _ = require('lodash');
const stats = localRequire('helpers/stats');
const rules = localRequire('helpers/rules');
const error = localRequire('helpers/error');
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

module.exports = (ctx) => {
  const cloneCtx = ctx;
  const account = ctx.params.account;
  const app = ctx.params.app;
  if (!rules.validate(ctx, account, app)) {
    throw error('token is wrong', 403);
  }
  const data = getData(ctx.method, ctx);
  const now = Date.now();
  // 允许统计时间是delay时间之前生成的（因为客户端有可能先缓存统计数据，再一齐发送）
  const min = `${now - config.delay}000000`;
  // 允许客户端的时间与服务器有5秒的时间偏差
  const max = `${now + 5 * 1000}999999`;
  let count = 0;
  _.forEach(data, item => {
    const tmp = item;
    if (tmp.m && tmp.f) {
      // 时间设置的是ms，补6个位
      if (tmp.time) {
        if (tmp.time.length === 13) {
          tmp.time += _.random(100000, 999999);
        }
        if (tmp.time < min || tmp.time > max) {
          return;
        }
      }
      stats.write(`${account}-${app}`, tmp.m, tmp.f, tmp.t, tmp.time);
      count++;
    }
  });
  if (count) {
    stats.write(config.app, 'write-point', {
      count,
    }, {
      account,
      app,
    });
  }
  cloneCtx.body = {
    count: count
  };
};

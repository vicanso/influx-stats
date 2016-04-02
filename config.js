'use strict';
const pkg = require('./package');
const env = process.env.NODE_ENV || 'development';

exports.version = pkg.appVersion;

exports.env = env;

exports.port = process.env.PORT || 3000;

exports.app = pkg.name;

exports.instance = `${pkg.name}-${process.env.NAME || process.env.HOSTNAME || Date.now()}`;

// app url prefix for all request
exports.appUrlPrefix = env === 'development' ? '' : '/influxdb-collector';

// log server url
exports.log = process.env.LOG;

// http log type
const fmt = ':remote-addr ":method :url HTTP/:http-version" :status :length ":user-agent"';
exports.logType = env === 'development' ? 'dev' : fmt;

exports.etcd = process.env.ETCD;

exports.influx = process.env.INFLUX;

// http connection limit options
exports.limitOptions = {
  mid: 100,
  high: 500,
};

// rules url，eg: http://7xod89.com1.z0.glb.clouddn.com/rules.json
exports.rules = process.env.RULES;

// http request concurrency reach high, wait for `limitResetInterval` to reset app 'running'
exports.limitResetInterval = 5000;

// admin token (jenny)
exports.adminToken = '6a3f4389a53c889b623e67f385f28ab8e84e5029';

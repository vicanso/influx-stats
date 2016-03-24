'use strict';
const config = localRequire('config');
const debug = require('debug')(config.app);
module.exports = debug;
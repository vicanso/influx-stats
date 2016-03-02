'use strict';
const fs = require('fs');
const pkg = require('../package');
const path = require('path');
pkg.appVersion = (new Date()).toISOString();

fs.writeFileSync(path.join(__dirname, '../package.json'), JSON.stringify(pkg, null, 2));
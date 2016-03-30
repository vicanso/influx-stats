'use strict';
const pkg = require('./package');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const rimraf = require('rimraf');

function rm(file) {
  return new Promise((resolve, reject) => {
    rimraf(file, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

pkg.appVersion = (new Date()).toISOString();

fs.writeFileAsync('./package.json', JSON.stringify(pkg, null, 2))
  .then(rm('node_modules'))
  .catch(err => {
    console.error(err);
  });

'use strict';
const request = require('superagent');
const _ = require('lodash');

function randomMethod() {
  const range = [20, 23, 24, 25, 30];
  const methodList = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'];
  const index = _.sortedIndex(range, _.random(0, 29));
  return methodList[index] || 'GET';
}

function random() {
  return {
    code: _.random(0, 599),
    bytes: _.random(0, 100 * 1024),
    use: _.random(0, 5000),
    method: _.sample(['GET', 'POST', 'PUT', 'DELETE', 'HEAD'])
  };
}

function random50x() {
  return {
    code: _.random(500, 599),
    bytes: _.random(0, 2 * 1024),
    use: _.random(0, 100),
    method: randomMethod(),
  };
}


function random20x() {
  return {
    code: _.random(200, 299),
    bytes: _.random(2 * 1024, 50 * 1024),
    use: _.random(100, 4000),
    method: randomMethod(),
  };
}

function random30x() {
  return {
    code: _.random(300, 399),
    bytes: _.random(0, 1024),
    use: _.random(100, 2000),
    method: 'GET',
  };
}

function random40x() {
  return {
    code: _.random(400, 499),
    bytes: _.random(0, 1024),
    use: _.random(100, 1000),
    method: randomMethod(),
  };
}

function writePoint() {
  const range = [20, 30, 35, 38];
  const fnList = [random20x, random30x, random40x, random50x];
  const index = _.sortedIndex(range, _.random(0, 37));
  const fn = fnList[index] || random20x;
  let fields = fn();
  const tags = {
    method: fields.method,
    status: fields.code / 100 | 0,
    spdy: _.sortedIndex([30, 300, 1000, 3000], fields.use),
    size: _.sortedIndex([1024, 5 * 1024, 15 * 1024, 50 * 1024], fields.bytes),
  };
  delete fields.method;
  const data = {
    m: 'http',
    t: tags,
    f: fields,
  };

  const intervalConfig = {
    '0': [1000, 3000],
    '1': [1000, 3500],
    '2': [1000, 4000],
    '3': [1000, 5000],
    '4': [1000, 5000],
    '5': [1000, 5000],
    '6': [1000, 4000],
    '7': [1000, 3000],
    '8': [0, 2500],
    '9': [0, 1000],
    '10': [0, 2000],
    '11': [0, 2000],
    '12': [0, 2500],
    '13': [0, 1500],
    '14': [0, 2000],
    '15': [0, 3000],
    '16': [0, 3000],
    '17': [0, 3000],
    '18': [0, 2500],
    '19': [0, 2000],
    '20': [0, 1500],
    '21': [0, 1000],
    '22': [0, 800],
    '23': [0, 1500],
  };
  const intervalArr = intervalConfig[(new Date()).getHours()];
  const interval = _.random(intervalArr[0], intervalArr[1]);

  request.post('http://127.0.0.1:8080/influxdb-collector/add-points/vicanso/timtam')
    .type('json')
    .set('x-influx-token', 'Tree.Xie')
    .send(data)
    .end((err, res) => {
      if (err) {
        console.error(err);
      }
    });
  setTimeout(writePoint, interval);
}

writePoint();
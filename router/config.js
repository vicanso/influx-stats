'use strict';
module.exports = [
  // system start
  'GET /sys/version c.system.version',
  'GET /sys/stats c.system.stats',
  'POST /sys/pause m.auth.admin,c.system.pause',
  'POST /sys/resume m.auth.admin,c.system.resume',
  'POST /sys/safe-exit m.auth.admin,c.system.safeExit',
  // sysetm end
  // influxdb start
  'GET,POST /add-points/:account/:app c.influx',
  // influxdb end
];

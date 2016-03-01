'use strict';

module.exports = [
	// system start
	'GET /sys/version c.system.version',
	'GET /sys/stats c.system.stats',
	'POST /sys/pause m.auth.admin,c.system.pause',
	'POST /sys/resume m.auth.admin,c.system.resume',
	'POST /sys/safe-exit m.auth.admin,c.system.safeExit',
	// sysetm end

	// stats start
	'POST /stats/exception c.stats.exception',
	'POST /stats/statistics c.stats.statistics',
	'POST /stats/ajax c.stats.ajaxStats',
	// stats end

	'GET,POST /add-points/:app c.influx',


	// common test
	'GET /common/deprecate m.deprecate,c.common.deprecate',
	'GET /common/no-store m.noStore,c.common.noStore'
];
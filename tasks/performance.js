'use strict';
const v8 = require('v8');
const toobusy = require('toobusy-js');
const MB = 1024 * 1024;
const config = localRequire('config');
const stats = localRequire('helpers/stats');


module.exports = run;


function run(interval) {
	const heapStats = v8.getHeapStatistics();
	const lag = toobusy.lag();
	const physical = parseInt(heapStats.total_physical_size / MB);
	const exec = parseInt(heapStats.total_heap_size_executable / MB);

	const fields = {
		lag: lag,
		exec: exec,
		physical: physical
	};
	const tags = {
		inst: config.instance
	};
	stats.write(config.app, 'performance', fields, tags);

	/* istanbul ignore next */
	setTimeout(() => {
		run(interval);
	}, interval);
}
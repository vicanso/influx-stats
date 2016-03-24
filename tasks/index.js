'use strict';
const config = localRequire('config');
const stats = localRequire('helpers/stats');
const performance = require('performance-nodejs');
const backendRefreshInterval = 500 * 1000;
const MB = 1024 * 1024;
return;
performance(data => {
	const physical = data.heap.total_physical_size / MB | 0;
	const exec = data.heap.total_heap_size_executable / MB | 0;
	const fields = {
		lag: Math.max(data.lag, 0),
		exec: data.heap.total_heap_size_executable / MB | 0,
		physical: data.heap.total_physical_size / MB | 0
	};
	stats.write(config.app, 'performance', fields, {
		inst: config.instance
	});
});

if (!config.etcd) {
	return;
}
const backend = localRequire('tasks/backend');
const refresh = () => {
	backend.refresh().then(() => {
		console.info('refresh service success');
		setTimeout(refresh, backendRefreshInterval).unref();
	}).catch(err => {
		console.error(err);
		setTimeout(refresh, 10 * 1000).unref();
	});
};

backend.register().then(data => {
	console.info(`register service success, data:${JSON.stringify(data)}`);
	setTimeout(refresh, backendRefreshInterval).unref();
}).catch(err => {
	console.error(err);
});
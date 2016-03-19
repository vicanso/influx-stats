'use strict';
const config = localRequire('config');
const backendRefreshInterval = 500 * 1000;
localRequire('tasks/performance')(5 * 1000);
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
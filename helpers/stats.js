'use strict';
const Influx = require('simple-influx');
const config = localRequire('config');
const debug = localRequire('helpers/debug');
const clientDict = {};
exports.write = write;


function write(app, series, tags, values) {
	debug('app:%s, series:%s, tags:%j, values:%j', app, series, tags, values);
	const client = getClient(app);
	if (!client) {
		return;
	}
	client.write(series)
		.tag(tags)
		.value(values)
		.queue();
}



function getClient(app) {
	const influxUrl = config.influx;
	if (!influxUrl) {
		return;
	}
	if (clientDict[app]) {
		return clientDict[app];
	}
	const urlInfo = require('url').parse(influxUrl);
	const client = new Influx({
		host: urlInfo.hostname,
		port: parseInt(urlInfo.port),
		protocol: urlInfo.protocol.substring(0, urlInfo.protocol.length - 1),
		database: app
	});
	client.createDatabaseNotExists().then(() => {
		console.info(`create database ${config.app} success`);
	}).catch(err => {
		console.error(err);
	});
	clientDict[app] = client;
	return client;
}
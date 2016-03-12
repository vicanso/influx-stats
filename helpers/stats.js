'use strict';
const Influx = require('influxdb-nodejs');
const urlJoin = require('url-join');
const config = localRequire('config');
const debug = localRequire('helpers/debug');
const clientMap = new Map();
const queueMax = 10;

exports.write = write;

/**
 * [write description]
 * @param  {[type]} app    [description]
 * @param  {[type]} series [description]
 * @param  {[type]} tags   [description]
 * @param  {[type]} values [description]
 * @return {[type]}        [description]
 */
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
	if (client.writeQueueLength > queueMax) {
		client.syncWrite().catch(err => {
			console.error('influxdb sync fail:', err);
		});
	}
	return client;
}


/**
 * [getClient description]
 * @param  {[type]} app [description]
 * @return {[type]}     [description]
 */
function getClient(app) {
	const influxUrl = config.influx;
	if (!influxUrl) {
		return;
	}
	if (clientMap.get(app)) {
		return clientMap.get(app);
	}
	const client = new Influx(urlJoin(influxUrl, app));

	client.createDatabaseNotExists().then(() => {
		console.info(`create database ${app} success`);
	}).catch(err => {
		console.error(err);
	});
	clientMap.set(app, client);
	return client;
}
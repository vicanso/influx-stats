'use strict';
const _ = require('lodash');
const Influx = require('influxdb-nodejs');
const urlJoin = require('url-join');
const config = localRequire('config');
const debug = localRequire('helpers/debug');
const clientMap = new Map();
const queueMax = 10;
const throttleSync = _.throttle(sync, 10 * 1000);
exports.write = write;
exports.getClient = getClient;


function write(app, measurement, fields, tags, time) {
	if (!app || !measurement || !fields) {
		throw new Error('app, measurement an fields can not be null');
	}
	debug('app:%s, measurement:%s, fields:%j, tags:%j', app, measurement, fields,
		tags);
	const client = getClient(app);
	if (!client) {
		return;
	}
	const writer = client.write(measurement)
		.field(fields);
	if (tags) {
		writer.tag(tags);
	}
	if (time) {
		writer.time(time);
	}
	throttleSync();
	writer.queue();
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


function sync() {
	clientMap.forEach(client => {
		if (client.writeQueueLength) {
			client.syncWrite().catch(err => {
				console.error('influxdb sync fail:', err);
			});
		}
	});
}
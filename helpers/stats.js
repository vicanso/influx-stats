'use strict';
const Influx = require('simple-influx');
const config = localRequire('config');
const _ = require('lodash');
const clientDict = {};
exports.write = write;


function write(app, series, tags, values) {
	console.dir(arguments);
	const client = getClient(app);
	if (!client) {
		return;
	}
	values = _.extend({count: 1}, values);
	tags.inst = config.name;

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
	client.safeCreateDatabase().then(() => {
		console.info(`create database ${config.app} success`);
	}).catch(err => {
		console.error(err);
	});
	clientDict[app] = client;
	return client;
}
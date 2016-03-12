;(function() {
'use strict';
var root = this;


var queueData = [];
var influx = {
	// 数据提交的地址
	url: '/add-points/albi',
	write: write,
	getQueueData: getQueueData,
	sync: sync
};

function isObject(v) {
	return !!v && typeof v === 'object';
}

function getQueueData() {
	return queueData.slice(0);
}

function write(series, tags, values) {
	/* istanbul ignore if */
	if (!series || !tags) {
		throw new Error('series and tags cat not be null');
	}
	var data = {
		series: series,
		tags: tags
	};
	if (values) {
		data.values = values;
	}
	return {
		queue: function() {
			queueData.push(data);
		},
		end: function(cb) {
			send([data], cb);
		}
	};
}

function send(arr, cb) {
	/* istanbul ignore if */
	if (!arr || !arr.length) {
		return cb();
	}
	var queryStr = [];
	for(var i = 0, len = arr.length; i < len; i++){
		var str = 'point=';
		var data = arr[i];
		str += 'series(' + data.series + ')';
		str += ',' + getTags(data.tags);
		if (data.values) {
			str += ',' + getValues(data.values);
		}
		queryStr.push(str);
	}
	var url = influx.url + '?' + queryStr.join('&');
	var img = new Image();
	img.onload = function() {
		cb();
	};
	img.onerror = cb;
	img.src = url;
	arr.length = 0;
}

function sync(cb) {
	send(queueData, cb);
} 

function getTags(tags) {
	return 'tags(' + format(tags) + ')';
}

function getValues(values) {
	return 'values(' + format(values) + ')';
}


function format(obj) {
	var str = '';
	for(var k in obj) {
		str += (k + '|' + obj[k]);
	}
	return str;
}

/* istanbul ignore if */
if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
	define(function() {
		return influx;
	});
} else if (isObject(module) && isObject(module.exports)) {
	module.exports = influx;
} else {
	/* istanbul ignore next */ 
	root.influx = influx;
}

}.call(this));
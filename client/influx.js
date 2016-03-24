;(function() {
'use strict';
var root = this;


var Cache = {
	data: [],
	max: 10,
	add: function(item) {
		this.data.push(item);
		if(this.data.length > this.max) {
			this.data.shift();
		}
		this.length = this.data.length;
		return this;
	},
	length: 0,
	toJSON: function() {
		return this.data.slice(0);
	},
	clear: function() {
		this.data.length = 0;
		this.length = 0;
	}
};

var influx = {
	// 数据提交的地址
	url: '/add-points/albi',
	write: write,
	getQueueData: getQueueData,
	getQueueLength: getQueueLength,
	sync: sync,
	setQueueMax: setQueueMax
};


function getQueueData() {
	return Cache.toJSON();
}

function setQueueMax(v) {
	Cache.max = v;
}

function getQueueLength() {
	return Cache.length;
}

function write(measurement, fields, tags) {
	/* istanbul ignore if */
	if (!measurement || !fields) {
		throw new Error('measurement and fields cat not be null');
	}
	var data = {
		measurement: measurement,
		fields: fields,
		time: now()
	};
	if (tags) {
		data.tags = tags;
	}
	return {
		queue: function() {
			Cache.add(data);
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
		str += 'm(' + data.measurement + ')';
		str += ',' + getFields(data.fields);
		if (data.tags) {
			str += ',' + getTags(data.tags);
		}
		str += ',time(' + data.time + ')';
		queryStr.push(str);
	}
	var url = influx.url + '?' + queryStr.join('&');
	var img = new Image();
	img.onload = function() {
		cb();
	};
	img.onerror = cb;
	img.src = url;
}

function sync(cb) {
	send(Cache.toJSON(), cb);
	Cache.clear();
} 

function getTags(tags) {
	return 't(' + format(tags) + ')';
}

function getFields(fields) {
	return 'f(' + format(fields) + ')';
}


function format(obj) {
	var arr = [];
	for(var k in obj) {
		arr.push(k + '|' + obj[k]);
	}
	return arr.join(',');
}
function now() {
	var time;
	if (Date.now) {
		time = Date.now();
	} else {
		time = (new Date()).getTime();
	}
	return '' + time;
}



function isObject(v) {
	return !!v && typeof v === 'object';
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
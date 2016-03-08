'use strict';
const assert = require('assert');
const influx = require('../client/influx');

describe('influx-client', () => {

	it('write point success', done => {
		class Image {
			constructor() {

			}
			set src(v) {
				assert.equal(v, '/add-points/albi?point=series(http),tags(type|2spdy|fast),values(use|30code|200)');
				setTimeout(this.onload, 100);
			}
		}

		global.Image = Image;

		influx.write('http', {
			type: '2',
			spdy: 'fast'
		}, {
			use: 30,
			code: 200
		}).end(done);
	});

	it('queue point success', done => {
		influx.write('http', {
			type: '2',
			spdy: 'fast'
		}, {
			use: 30,
			code: 200
		}).queue();

		influx.write('http', {
			type: '5',
			spdy: 'slow'
		}, {
			use: 300,
			code: 500
		}).queue();
		assert.equal(influx.getQueueData().length, 2);
		done();
	});

	it('sync queue points success', done => {
		class Image {
			constructor() {

			}
			set src(v) {
				assert.equal(v, '/add-points/albi?point=series(http),tags(type|2spdy|fast),values(use|30code|200)&point=series(http),tags(type|5spdy|slow),values(use|300code|500)');
				setTimeout(this.onload, 100);
			}
		}

		global.Image = Image;

		influx.sync(done);
	});
});
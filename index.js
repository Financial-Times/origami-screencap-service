'use strict';

const dotenv = require('dotenv');
const service = require('./lib/service');
const throng = require('throng');

dotenv.config();

const options = {
	log: console,
	name: 'Origami ScreenCap Service',
	workers: process.env.WEB_CONCURRENCY || 1
};

throng({
	workers: options.workers,
	start: startWorker
});

async function startWorker(id) {
	try {
		console.log(`Starting worker ${id}`);
		await service(options).listen();
		console.log(`Started worker ${id}`);
	} catch (error) {
		console.error(error.stack);
		process.exit(1);
	}
}

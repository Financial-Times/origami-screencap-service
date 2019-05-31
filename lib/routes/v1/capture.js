'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const crypto = require('crypto');
const fs = require('fs-extra');
const httpError = require('http-errors');
const path = require('path');
const puppeteer = require('puppeteer');
const url = require('url');

module.exports = async app => {

	let browser;

	process.on('beforeExit', () => {
		if (browser) {
			browser.close();
		}
	});

	const oneDay = 60 * 60 * 24;
	const cacheForOneDay = cacheControl({
		maxAge: oneDay
	});

	// Middleware to get capture options
	function getCaptureOptions(request, response, next) {
		const captureOptions = request.captureOptions = {
			fullPage: Boolean(request.query.fullPage),
			url: request.query.url,
			viewportWidth: parseInt(request.query.viewportWidth || 1200, 10),
			viewportHeight: parseInt(request.query.viewportHeight || 800, 10),
		};

		// We must have a URL
		if (!captureOptions.url) {
			return next(httpError(400, 'Please provide a "url" query parameter'));
		}

		// We must have a valid viewport width and height
		if (captureOptions.viewportWidth < 200 || captureOptions.viewportWidth > 5120) {
			return next(httpError(400, 'Please provide a "viewportWidth" query parameter between 0 and 5120'));
		}
		if (captureOptions.viewportHeight < 200 || captureOptions.viewportHeight > 5120) {
			return next(httpError(400, 'Please provide a "viewportHeight" query parameter between 0 and 5120'));
		}

		// We can't allow capturing of a capture service URL
		const hostname = url.parse(captureOptions.url).hostname;
		const disallowedHostnames = [
			'origami-screencap-service-qa.herokuapp.com',
			'origami-screencap-service-eu.herokuapp.com',
			'origami-screencap-service-us.herokuapp.com',
			'screencap.in.ft.com'
		];
		if (disallowedHostnames.includes(hostname.toLowerCase())) {
			return next(httpError(400, '"url" parameter cannot point to the capture service'));
		}

		next();
	}

	// Capture an image
	app.get('/v1/capture', cacheForOneDay, getCaptureOptions, async (request, response, next) => {
		try {
			const captureOptions = request.captureOptions;

			// Get the image file path
			const filePath = path.resolve(
				__dirname, '..', '..', '..', 'tmp',
				`${crypto.createHash('md5').update(JSON.stringify(captureOptions)).digest('hex')}.png`
			);
			if (await fs.pathExists(filePath)) {
				return response.sendFile(filePath);
			}

			// Set up browser if required. Sorry first user
			if (!browser) {
				browser = await puppeteer.launch({
					args: [
						'--no-sandbox'
					]
				});
			}

			// Go to URL
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.setViewport({
				width: captureOptions.viewportWidth,
				height: captureOptions.viewportHeight
			});

			// TODO set a timeout and error if the page takes too long to load
			await page.goto(captureOptions.url);

			await page.screenshot({
				path: filePath,
				fullPage: captureOptions.fullPage
			});
			await context.close();
			response.sendFile(filePath);

		} catch (error) {
			next(error);
		}
	});

};

'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// TODO we should cache
	const neverCache = cacheControl({
		maxAge: 0
	});

	// Capture an image
	app.get('/v1/capture', neverCache, async (request, response, next) => {
		try {
			response.send('IMAGE GOES HERE');
		} catch (error) {
			next(error);
		}
	});

};

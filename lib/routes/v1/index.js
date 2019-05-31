'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	const neverCache = cacheControl({
		maxAge: 0
	});

	// Home page
	app.get('/v1/', neverCache, async (request, response, next) => {
		try {
			response.render('index', {
				title: app.ft.options.name,
				layout: 'landing'
			});
		} catch (error) {
			next(error);
		}
	});

};

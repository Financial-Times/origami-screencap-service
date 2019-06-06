'use strict';

const healthChecks = require('./health-checks');
const origamiService = require('@financial-times/origami-service');

module.exports = service;

function service(options) {

	const health = healthChecks(options);
	options.healthCheck = health.checks();
	options.goodToGoTest = health.gtg();
	options.about = require('../about.json');
	options.defaultLayout = 'main';

	const app = origamiService(options);

	app.use(origamiService.middleware.getBasePath());
	require('./routes/home')(app);
	require('./routes/purge')(app);
	require('./routes/v1/index')(app);
	require('./routes/v1/capture')(app);
	require('./routes/v1/slack')(app);
	app.use(origamiService.middleware.notFound());
	app.use(origamiService.middleware.errorHandler());

	return app;
}

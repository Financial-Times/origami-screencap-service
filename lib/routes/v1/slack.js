'use strict';

const bodyParser = require('body-parser');
const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = async app => {

	const neverCache = cacheControl({
		maxAge: 0
	});

	// Respond to a Slack slash command
	app.get('/v1/slack', neverCache, bodyParser.urlencoded(), async (request, response) => {
		try {
			if (!request.body.text) {
				return response.send({
					text: 'Error: no body text'
				});
			}
			const captureUrl = request.body.text;
			const imageUrl = `https://origami-screencap.ft.com/v1/capture?source=slack&url=${encodeURIComponent(captureUrl)}`;
			response.send({
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `Here's your screencapture, <@${request.body.user_id}> :origami-heart:`
						},
						accessory: {
							type: 'image',
							image_url: imageUrl,
							alt_text: `Screen capture of "${captureUrl}"`
						}
					}
				]
			});
		} catch (error) {
			return response.send({
				text: 'Error: something went seriously wrong generating your screencapture.'
			});
		}
	});

};

'use strict';

const bodyParser = require('body-parser');
const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = async app => {

	const neverCache = cacheControl({
		maxAge: 0
	});

	// Respond to a Slack slash command
	app.post('/v1/slack', neverCache, bodyParser.urlencoded(), async (request, response) => {
		try {
			if (!request.body.text) {
				return response.send({
					text: 'Error: no body text'
				});
			}
			const captureUrl = request.body.text;
			const imageUrl = `https://origami-screencap.ft.com/v1/capture?source=slack&url=${encodeURIComponent(captureUrl)}`;
			response.send({
				response_type: 'in_channel',
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `Here's your screencapture, <@${request.body.user_id}> :origami-heart:`
						}
					},
					{
						type: 'image',
						title: {
							type: 'plain_text',
							text: `Screen capture of "${captureUrl}"`,
							emoji: true
						},
						image_url: imageUrl,
						alt_text: `Screen capture of "${captureUrl}"`
					},
					{
						type: 'context',
						elements: [
							{
								type: 'mrkdwn',
								text: 'For more info, speak to the Origami team in <#C02FU5ARJ>'
							}
						]
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

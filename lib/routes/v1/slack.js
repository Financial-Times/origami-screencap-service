'use strict';

const bodyParser = require('body-parser');
const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const querystring = require('querystring');

module.exports = async app => {

	const neverCache = cacheControl({
		maxAge: 0
	});

	// Respond to a Slack slash command
	app.post('/v1/slack', neverCache, bodyParser.urlencoded(), async (request, response) => {
		const contextBlock = {
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text: 'This is a beta service. For more info, speak to the Origami team in <#C02FU5ARJ>'
				}
			]
		};
		try {
			if (!request.body.text || !request.body.text.trim()) {
				return response.send({
					blocks: [
						{
							type: 'section',
							text: {
								type: 'mrkdwn',
								text: ':warning: You need to specify a URL to capture. Like this: ```/screencap https://origami.ft.com/```'
							}
						},
						contextBlock
					]
				});
			}
			let captureQuery = {};
			if (/^https?:\/\/[^\s]+$/i.test(request.body.text)) {
				captureQuery.url = request.body.text;
			} else {
				captureQuery = querystring.parse(request.body.text, ' ', '=');
			}
			captureQuery.source = 'slack';
			const imageUrl = `https://origami-screencap.ft.com/v1/capture?${querystring.stringify(captureQuery)}`;
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
							text: `Screen capture of "${captureQuery.url}"`,
							emoji: true
						},
						image_url: imageUrl,
						alt_text: `Screen capture of "${captureQuery.url}"`
					},
					contextBlock
				]
			});
		} catch (error) {
			return response.send({
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: ':warning: Something went really wrong with the Origami ScreenCap service. It is in Beta after all :shrug:'
						}
					},
					contextBlock
				]
			});
		}
	});

};

'use strict';
require('dotenv').config();
const line = require('@line/bot-sdk');
const createHandler = require("azure-function-express").createHandler;
const express = require('express');

// LINE SDK config
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// LINE SDK client
const client = new line.Client(config);
const app = express();

app.get('/api/webhook', (req, res) => res.send('Welcome to CoderDojo Dazaifu!'));

app.post('/api/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    /*
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore
        return Promise.resolve(null);
    }
    const echo = {type: 'text', text: event.message.text };
    // reply to sender
    return client.replyMessage(event.replyToken, echo);
    */
    switch (event.type) {
        case 'message':
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: event.message.text
            });
        case 'follow':
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'はじめまして！'
            });
        case 'unfollow':
            return Promise.resolve(null);
        case 'join':
            return Promise.resolve(null);
        case 'leave':
            return Promise.resolve(null);
        case 'postback':
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'ポストバック'
            });
        default:
            throw new Error('Unknown event');
    }
}

module.exports = createHandler(app);

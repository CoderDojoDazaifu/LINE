'use strict';
require('dotenv').config();
const line = require('@line/bot-sdk');
const createHandler = require("azure-function-express").createHandler;
const express = require('express');

const tedConn = require('tedious').Connection;
const tedConfig = {
    server: process.env.DB_SERVER,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER_NAME,
            password: process.env.DB_PASSWORD
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: process.env.DB_DATABASE
    }
}
const tedReq = require('tedious').Request;
const tedTYPES = require('tedious').TYPES;  

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
            const msg = event.message.text;
            const userId = event.source.userId;

            var conn = new tedConn(tedConfig);  
            conn.on('connect', function(err) {  
                if (err) {
                    console.log("Not Connected");  
                    return client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: 'ERROR:' + err.stack
                    });    
                }
                // If no error, then good to proceed.  
                console.log("Connected");  
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: userId
                });
            });
    
            // UserIdでDBを検索し、名前が登録されているかどうか確認する
            // 名前が登録されていない場合
            // 言語解析で名前だけを抽出する
            // 名前が登録されている場合
/*
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: userId
            });
*/
            case 'follow':
            return client.replyMessage(event.replyToken, [{
                type: 'text',
                text: 'CoderDojo 太宰府をお友だちに追加していただき、ありがとうございます\uDBC0\uDC2D\nこのアカウントからは、CoderDojo 太宰府の開催のお知らせや、お子様、保護者の皆様にとって有用な情報を発信していきたいと思っています\uDBC0\uDC61'
            }, {
                type: 'text',
                text: 'チャンピオン(主宰)の三木です\uDBC0\uDC03\n今後ともよろしくお願いします\uDBC0\uDCB2\nさっそくお願いですが、LINEのアカウント名だと、どなたかわからないことがあるので、あなたのお名前をフルネームで教えてください\uDBC0\uDC02\n左下のキーボードから入力するか、メニューの「登録情報」から登録いただけます\uDBC0\uDC41',
                sender: {
                    name: "チャンピオン 三木",
                    iconUrl: "https://p62.f2.n0.cdn.getcloudapp.com/items/04uPNLeG/59UcuxelIy3u3Nc1584956046_1584956055.png?v=c586b91712e6400e8055dc46c7f30ac9",
                }
            }]);
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

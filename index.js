
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === 'Generic'){ 
				console.log("welcome to chatbot")
				continue
			}
			let message = text.substring(0, 50).toLowerCase();
			switch(message){
				case "info":
					sendTextMessage(sender, "Match am 14.00");
					break;
				case "info 2":
					sendTextMessage(sender, "Match am 17.00");
					break;
				case "info 1":
					sendTextMessage(sender, "Match abgesagt");
					break;
				default:
					sendTextMessage(sender, "Text nicht erkannt: " + text.substring(0, 200));
			}
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAEL0OBZCwQIBAORlZADdR7ZAg4hpaVyQpvQ2qLg9rCQAcCu4R2j6aFGXxHJZCTBLEY9MBR888rhWoDss2rJsn3PGiT5tPZAhqDjG3hlfHmLONO5COYsu9uhYCJ9EEl8KIZAZC1bOg4jaZAI6Vkom0shzBAXo46ycfvcTCW1vm7CaAZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
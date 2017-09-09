
'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const cheerio = require("cheerio");

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
				case "hilfe":
					sendTextMessage(sender, "Für allgemeine Informationen sende \"Info\"\n Für Infos zur 1. Mannschaft sende \"Info 1\"\n Für Liveticker zur 1.Mannschaft sende \"Live 1\"\n");
					break;
				case "info":
					sendTextMessage(sender, "GV am 8. September");
					break;
				case "info 1":
					sendTextMessage(sender, "Match am 14.00");
					break;
				case "info 2":
					sendTextMessage(sender, "Match am 17.00");
					break;
				case "info 3":
					sendTextMessage(sender, "Match abgesagt");
					break;
				case "live 1":
					sendTextMessage(sender, "FCKB - FC Attiswil 1:0");
					break;
				case "live 2":
					sendTextMessage(sender, "FCKB - FC Kestenholz 4:0");
					break;
				case "live 3":
					sendTextMessage(sender, "FC Mümliswil - FCKB 0:7");
					break;
				case "bericht 2":
					callWebsite();
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



var HtmlBody;
var filter = ["</span>", "</strong>", "</p>", "<span style=\"font-size: small;\">", "<p", "<p>", "<span", "style=\"", "margin:", "0cm", "'Arial',sans-serif;\">", "0pt;\">", "&nbsp;", "font-family:", ">", "  "];

function callWebsite(){
  request({
    uri: "http://www.fc-klus-balsthal.ch/teams/2-mannschaft/1702",
  }, function(error, response, body) {


    var NameString = body.toString();
    //console.log(NameString);
    var indexStart = NameString.lastIndexOf("2. Mannschaft ");
    var indexStop = NameString.indexOf("<ul class=\"uk-pagination\">");
    console.log(indexStart + " - " + indexStop)
    var out = NameString.substring(indexStart, indexStop);
  
    for (i = 0; i < filter.length; i++) {
	  var out = out.replaceAll(filter[i], "");
    }
  
    sendTextMessage(out);
  }); 
}

 String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
}
var express = require('express');
var app = express();
var jade = require('jade');
var store = require('./store.js');

var fn = jade.compileFile('index.jade');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
	var cardUrl = 'https://api.deckbrew.com/mtg/cards?oracle={G}&oracle={W}&type=land';
	store.getUrl(cardUrl, function(err, data){
		var cards = JSON.parse(data);
		var htmlout = fn({'cards': cards});
		response.send(htmlout)
	});
// 	response.send('thinking');
})

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
})

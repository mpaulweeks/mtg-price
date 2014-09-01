var express = require('express');
var app = express();
var jade = require('jade');
var store = require('./store.js');

var fn = jade.compileFile('index.jade');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var cardsFunc = function(response){
	var sendCards = function(err, cards){
		var htmlout = fn({'cards': cards});
		response.send(htmlout);
	}
	return sendCards;
}

var filename_default = 'dump.txt';

app.get('/save', function(request, response) {
	var cardUrl = 'https://api.deckbrew.com/mtg/cards?type=land';
	var filename = filename_default;
	store.saveCardsToFile(cardUrl, filename, function(err, data){
		response.send('success! ' + data.length + ' cards saved to ' + filename);
	});
})

app.get('/', function(request, response) {
	store.getFile(filename_default, cardsFunc(response));
})

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
})

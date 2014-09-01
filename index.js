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

app.get('/refresh', function(request, response) {
	store.saveCardsToFile(function(err, data){
		response.send('success! ' + data.cards + ' cards saved to ' + data.filename);
	});
})

app.get('/', function(request, response) {
	store.getFile(cardsFunc(response));
})

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
})

var express = require('express');
var app = express();
var jade = require('jade');
var store = require('./modules/store.js');
var gather = require('./modules/gather.js');
var filterer = require('./modules/filterer.js');

var fn = jade.compileFile('index.jade');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var cardsFunc = function(response, filterFunc){
	var sendCards = function(err, cards){
		gather.setCards(cards);
		if(filterFunc){
			cards = filterFunc(cards);
		}
		cards.sort(function(a,b){
			return a.best_price - b.best_price;
		});
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

var kozilek = {
	'and': [],
	'or': [],
	'not': ['W','U','B','R','G']
}

var sisay = {
	'and': [],
	'or': ['W','G'],
	'not': ['U','B','R']
}

var azorius = {
	'or': [],
	'and': ['W','U'],
	'not': []
}

app.get('/', function(request, response) {
	store.getFile(cardsFunc(response));
});

app.get('/kozilek', function(request, response) {
	var filterFunc = function(cards){
		return filterer.edh(cards, kozilek);
	};
	store.getFile(cardsFunc(response, filterFunc));
});

app.get('/sisay', function(request, response) {
	var filterFunc = function(cards){
		return filterer.edh(cards, azorius);
	};
	store.getFile(cardsFunc(response, filterFunc));
});

app.get('/azorius', function(request, response) {
	var filterFunc = function(cards){
		return filterer.produces(cards, azorius);
	};
	store.getFile(cardsFunc(response, filterFunc));
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});

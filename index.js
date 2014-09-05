var express = require('express');
var app = express();
var jade = require('jade');
var store = require('./modules/store.js');
var gather = require('./modules/gather.js');
var filterer = require('./modules/filterer.js');

var fn = jade.compileFile('index.jade');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var sendResponse = function(response, cards){
	var htmlout = fn({
		'cards': cards,
		'colors': gather.getColors()
	});
	response.send(htmlout);
};

var cardsFunc = function(response, filterFunc){
	var sendCards = function(err, cards){
		gather.setCards(cards);
		if(filterFunc){
			cards = filterFunc(cards);
		}
		cards.sort(function(a,b){
			return a.best_price - b.best_price;
		});
		sendResponse(response, cards);
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

var getFilter = function(filterFunc, params){
	var func = function(cards){
		return filterFunc(cards, params);
	};
	return func;
};

var createParams = function(request){
	var params = {
		'and': [],
		'or': [],
		'not': []
	};
	//interpret request
	return params;
};

app.get('/', function(request, response) {
	sendResponse(response, []);
});

app.get('/land', function(request, response) {
	var params = createParams(request);
	store.getLand(cardsFunc(response, getFilter(filterer.produces, params)));
});

app.get('/kozilek', function(request, response) {
	store.getLand(cardsFunc(response, getFilter(filterer.edh, kozilek)));
});

app.get('/sisay', function(request, response) {
	store.getLand(cardsFunc(response, getFilter(filterer.edh, azorius)));
});

app.get('/azorius', function(request, response) {
	store.getLand(cardsFunc(response, getFilter(filterer.produces, azorius)));
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});

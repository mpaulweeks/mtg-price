var express = require('express');
var app = express();

var jade = require('jade');
var fn = jade.compileFile('index.jade');

var repo = require('./modules/repo.js');
var metadata = require('./modules/metadata.js');
var filterer = require('./modules/filterer.js');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// helper funcs

var sendResponse = function(response, cards){
	var htmlout = fn({
		'cards': cards,
		'colors': metadata.getColors(),
		'formats': metadata.getFormats()
	});
	response.send(htmlout);
};

var displayLand = function(response, filterFunc){
	var sendCards = function(err, cards){
		if(filterFunc){
			cards = filterFunc(cards);
		}
		cards.sort(function(a,b){
			return a.best_price - b.best_price;
		});
		sendResponse(response, cards);
	}
	repo.getLand(sendCards);
};

var getFilter = function(params){
	var func = function(cards){
		return filterer.sift(cards, params);
	};
	return func;
};

var createParams = function(request){
	var out = {
		'and': [],
		'or': [],
		'not': [],
		'format': null
	};
	var query = request.query;
	for (key in out) {
		if (key in query){		
			if (key == 'format' && query.format == 'null'){
				//do nothing
			} else if(query[key] instanceof Array) {
				out[key] = query[key];
			} else {
				out[key] = [query[key]];
			}
		}
	};
	return out;
};

// listeners

app.get('/refresh', function(request, response) {
	repo.refresh(function(err, data){
		response.send(data);
	});
})

app.get('/', function(request, response) {
	sendResponse(response, []);
});

app.get('/land', function(request, response) {
	var params = createParams(request);
	displayLand(response, getFilter(params));
});

app.get('/edh/:id', function(request, response) {
	var card_id = request.params.id;
	repo.getEdh(function (err, cards){
		for(c in cards){
			if(c[id] == card_id){
				return displayLand(response, getFilter(c.edh_filter));
			}
		}
	});
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});
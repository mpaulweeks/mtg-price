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

var sendResponse = function(response, data){
	data = data || {};
	data.colors = metadata.getColors();
	data.formats = metadata.getFormats();
	repo.getEdh(function (err, cards){
		data.edh_auto= []
		cards.forEach(function (c){
			data.edh_auto.push(c);
		});
		var htmlout = fn(data);
		response.send(htmlout);
	});
};

var displayLand = function(response, filterParams, general){
	repo.getLand(function(err, lands){
		if(filterParams){
			lands = filterer.sift(lands, filterParams);
		}
		lands.sort(function(a,b){
			return a.best_price - b.best_price;
		});
		var data = {
			'lands': lands,
			'general': general,
			'similar': []
		};
		var filter_json = JSON.stringify(filterParams);
		repo.getEdh(function (err, edhs){
			edhs.forEach(function (c){
				if(c.edh_filter_json === filter_json && c != general){
					data.similar.push(c);
				}
			});
			sendResponse(response, data);
		});
	});
};

var parseLandQuery = function(request){
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
			} else if(out[key] instanceof Array && !(query[key] instanceof Array)) {
				out[key] = [query[key]];
			} else {
				out[key] = query[key];
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
	var filterParams = parseLandQuery(request);
	displayLand(response, filterParams);
});

app.get('/edh', function(request, response) {
	var card_id = request.query.edh_id;
	repo.getEdh(function (err, cards){
		cards.forEach(function (c){
			if(c.id == card_id){
				return displayLand(response, c.edh_filter, c);
			}
		});
	});
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});
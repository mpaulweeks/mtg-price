var https = require('https');
var fs = require('fs');

var cardUrl = 'https://api.deckbrew.com/mtg/cards?type=land';
var filename = 'dump.txt';

var getUrl_helper = function(url, page, cards, callback){
	https.get(url + '&page=' + page, function(response){
		response.setEncoding('utf8');
		alldata = "";
		response.on('data', function(e) {
			alldata += e;
		});
		response.on('end', function(e) {
			var cards_added = JSON.parse(alldata);
			cards = cards.concat(cards_added);
			if(cards_added.length < 100){
				return callback(null, cards);
			} else {
				return getUrl_helper(url, page+1, cards, callback);
			}
		});
		response.on('error', function(e) {
			return callback(e);
		});
	});
};

var getUrl = function(url, callback){
	getUrl_helper(url, 0, [], callback);
};

var formatDigits = function(input, expectedDigits){
	var str = '' + input;
	while(str.length < expectedDigits){
		str = '0' + str;
	}
	return str;
};

var addTimestamp = function(cards_raw){
	var time = new Date();
	time.setDate(time.getDate() + 1); //record it as tomorrow
	var stamp = time.getFullYear()
			+ '-' + formatDigits((time.getMonth() + 1), 2)
			+ '-' + formatDigits(time.getDate(), 2);
	return stamp + cards_raw;
};

var parseTimestamp = function(cards_file){
	return {
		'timestamp': cards_file.substring(0,10),
		'cards': cards_file.substring(10)
	};
}

var calculateBestPrice = function(cards){
	cards.forEach(function (c){
		var best_price;
		c.editions.forEach(function (ed){
			if (ed.hasOwnProperty('price')){
				var editionPrice = ed.price.median;
				if(!best_price || (best_price > editionPrice)){
					best_price = editionPrice;
				}
			}
		});
		c.best_price = best_price;
		c.best_price_str = '$' + (best_price / 100);
	});
};

module.exports.saveCardsToFile = function (callback){
	getUrl(cardUrl, function(err, cards){
// 		cards = addTimestamp(cards);
		fs.writeFile(filename, JSON.stringify(cards), function(e){
			return callback(null, {
				'count': cards.length,
				'filename': filename
			});
		});
	});
}

module.exports.getFile = function(callback){
	fs.readFile(filename, function(err, data){
// 		var parsed = parseTimestamp(data);
// 		if(parsed.timestamp < new Date()){
// 			// async re-save cards
// 			module.exports.saveCardsToFile(function(e,d){});
// 		}
// 		return callback(null, JSON.parse(parsed.cards);
		var cards = JSON.parse(data);
		calculateBestPrice(cards);
		return callback(null, cards);
	});
}
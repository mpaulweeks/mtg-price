var https = require('https');
var fs = require('fs');

getUrl_helper = function(url, page, cards, callback){
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

module.exports.getUrl = function(url, callback){
	getUrl_helper(url, 0, [], callback);
};

module.exports.saveCardsToFile = function (url, filename, callback){
	module.exports.getUrl(url, function(err, cards){
		fs.writeFile(filename, JSON.stringify(cards), function(e){
			return callback(null, cards);
		});
	});
}

module.exports.getFile = function(filename, callback){
	fs.readFile(filename, function(err, data){
		return callback(null, JSON.parse(data));
	});
}
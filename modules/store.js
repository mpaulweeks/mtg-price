var https = require('https');
var fs = require('fs');

var landUrl = 'https://api.deckbrew.com/mtg/cards?type=land';
var landFile = 'land.txt';
var edhUrl = 'https://api.deckbrew.com/mtg/cards?type=creature&supertype=legendary';
var edhFile = 'edh.txt';

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

module.exports.saveCardsToFile = function (callback){
	var message = '';
	var count = 0;
	var finish = function(mess){
		message += mess;
		count += 1;
		if(count == 2){
			return callback(null, message);
		};
	};
	getUrl(landUrl, function(err, cards){
		fs.writeFile(landFile, JSON.stringify(cards), function(e){
			finish('saved ' + cards.length + ' lands to file<br/>');
			//next
			getUrl(edhUrl, function(err, cards){
				fs.writeFile(edhFile, JSON.stringify(cards), function(e){
					return finish('saved ' + cards.length + ' generals to file<br/>');
				});
			});
		});
	});
};

module.exports.getLandFromFile = function(callback){
	fs.readFile(landFile, function(err, data){
		console.log('loaded ' + landFile);
		var cards = JSON.parse(data);
		return callback(null, cards);
	});
};

module.exports.getEdhFromFile = function(callback){
	fs.readFile(edhFile, function(err, data){
		console.log('loaded ' + edhFile);
		var cards = JSON.parse(data);
		return callback(null, cards);
	});
};
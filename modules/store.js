var https = require('https');
var fs = require('fs');

var landUrl = 'https://api.deckbrew.com/mtg/cards?type=land';
var edhUrl = 'https://api.deckbrew.com/mtg/cards?type=creature&supertype=legendary';
var landFile = 'land.txt';
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
	var fileCount = 0;
	var finish = function(mess){
		fileCount += 1;
		message += mess;
		if(fileCount == 2){
			return callback(null, message);
		};
	};
	getUrl(landUrl, function(err, cards){
		fs.writeFile(landFile, JSON.stringify(cards), function(e){
			return finish('saved ' + cards.length + ' lands<br/>');
		});
	});
	getUrl(edhUrl, function(err, cards){
		fs.writeFile(edhFile, JSON.stringify(cards), function(e){
			return finish('saved ' + cards.length + ' generals<br/>');
		});
	});
};

module.exports.getLand = function(callback){
	fs.readFile(landFile, function(err, data){
		var cards = JSON.parse(data);
		return callback(null, cards);
	});
};

module.exports.getEdh = function(callback){
	fs.readFile(landFile, function(err, data){
		var cards = JSON.parse(data);
		return callback(null, cards);
	});
};
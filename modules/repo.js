var store = require('./store.js');
var metadata = require('./metadata.js');

var makeCache = function(storeFunc){
	return (function (){
		var cards = null;
		var publicMembers = {};
		
		publicMembers.getCards = function(callback){
			if(cards){
				return callback(null, cards);
			} else {
				storeFunc(function(err, data){
					cards = data;
					metadata.updateCards(cards);
					return callback(null, cards);
				});
			}
		};
		
		publicMembers.refresh = function(callback){
			cards = null;
			return publicMembers.getCards(callback);
		};
		
		return publicMembers;
	})();
}

var landCache = makeCache(store.getLandFromFile);
var edhCache = makeCache(store.getEdhFromFile);

module.exports.getLand = function(callback){
	return landCache.getCards(callback);
};

module.exports.getEdh = function(callback){
	return edhCache.getCards(callback);
};

module.exports.refresh = function(callback){
	store.saveCardsToFile(function(err, message){
		var count = 0;
		var finish = function(mess){
			message += mess;
			count += 1;
			if(count == 2){
				return callback(null, message);
			};
		};
		landCache.refresh(function(err, cards){
			return finish('loaded ' + cards.length + ' cards into landCache<br/>');
		});
		edhCache.refresh(function(err, cards){
			return finish('loaded ' + cards.length + ' cards into edhCache<br/>');
		});
	});
};

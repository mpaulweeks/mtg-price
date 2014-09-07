var store = require('./store.js');
var metadata = require('./metadata.js');

var landCache = null;
var edhCache = null;

var getLandFromFile = function(callback){
	store.getLandFromFile(function(err, data){
		landCache = data;
		metadata.updateCards(landCache);
		return callback(null, landCache);
	});
};

var getEdhFromFile = function(callback){
	store.getEdhFromFile(function(err, data){
		edhCache = data;
		metadata.updateCards(edhCache);
		return callback(null, edhCache);
	});
};

module.exports.getLand = function(callback){
	if(landCache){
		return callback(null, landCache);
	} else {
		return getLandFromFile(callback);
	}
};

module.exports.getEdh = function(callback){
	if(edhCache){
		return callback(null, edhCache);
	} else {
		return getEdhFromFile(callback);
	}
};

module.exports.refresh = function(callback){
	store.saveCardsToFile(function(message){
		var count = 0;
		var finish = function(mess){
			message += mess;
			count += 1;
			if(count == 2){
				return callback(null, message);
			};
		};
		getLandFromFile(function(cards){
			return finish('loaded ' + cards.length + ' cards into landCache<br/>');
		});
		getEdhFromFile(function(cards){
			return finish('loaded ' + cards.length + ' cards into edhCache<br/>');
		});
	});
};

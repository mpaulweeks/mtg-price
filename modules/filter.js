
var hasAll = function(source, sub){
	var result = true;
	sub.forEach(function (col){
		if(!source[col]){
			result = false;
		}
	});
	return result;
}

var hasOne = function(source, sub){
	var result = false;
	sub.forEach(function (col){
		if(source[col]){
			result = true;
		}
	});
	return result;
}

var hasNot = function(source, sub){
	var result = true;
	sub.forEach(function (col){
		if(source[col]){
			result = false;
		}
	});
	return result;
}

module.exports.edh = function(cards, requirements){
	var func = function(card){
		return hasNot(card.identity, requirements.not);
	};
	return cards.filter(func);
};	
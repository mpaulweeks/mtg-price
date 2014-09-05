
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
	return result || (sub.length === 0);
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

module.exports.sift = function(cards, requirements){
	var func = function(card){
		return hasAll(card.produces, requirements.and)
			&& hasOne(card.produces, requirements.or)
			&& hasNot(card.identity, requirements.not);
	};
	return cards.filter(func);
};
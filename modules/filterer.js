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

var isLegal = function(card, format){
	if(!format)
		return true;		
	if(format in card.formats && card.formats[format] == 'legal')
		return true;
	//else
	return false;
}			

module.exports.sift = function(cards, requirements){
	var func = function(card){
		return hasAll(card.produces, requirements.and)
			&& hasOne(card.produces, requirements.or)
			&& hasNot(card.identity, requirements.not)
			&& isLegal(card, requirements.format);
	};
	return cards.filter(func);
};
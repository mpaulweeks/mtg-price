var metadata = require('./metadata.js');

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

var hasNotColorless = function(source, sub){
	if(contains(sub, COLORLESS)){
		return hasNot(source, [COLORLESS]);
	}
	return true;
}
	

var contains = function(arr, elm){
	var out = false;
	arr.forEach(function (e){
		if(e == elm){
			out = true;
		}
	});
	return out;
}

var isLegal = function(card, format){
	if(!format)
		return true;		
	if(format in card.formats && card.formats[format] == 'legal')
		return true;
	//else
	return false;
}

var nonBasic = function(card){
	var isBasic = ('supertypes' in card) && contains(card.supertypes, 'basic');
// 	if(card.id === 'snow-covered-forest') console.log(card);
	return !isBasic;
}

module.exports.sift = function(cards, requirements){
	var func = function(card){
		return hasAll(card.produces, requirements.and)
			&& hasOne(card.produces, requirements.or)
			&& hasNot(card.identity, requirements.not)
			&& hasNotColorless(card.produces, requirements.not)
			&& isLegal(card, requirements.format)
			&& nonBasic(card);
	};
	return cards.filter(func);
};
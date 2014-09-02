var WHITE = 'W',
	BLUE = 'U',
	BLACK = 'B',
	RED = 'R',
	GREEN = 'G';
	
var colors = [WHITE,BLUE,BLACK,RED,GREEN];
	
var hasAny = function(text, items){
	var result = false;
	items.forEach(function (i){
		if(text.indexOf(i) > -1){
			result = true;
		}
	});
	return result;
}
	
module.exports.setCards = function(cards){
	cards.forEach(function (card){
		var identity = {};
		var produces = {};
		colors.forEach(function (col){
			identity[col] = false;
			produces[col] = false;
			var keywords = [
				'{' + col + '}',
				'/' + col + '}',
				'{' + col + '/'
			];	
			if(hasAny(card.text, keywords)){
				identity[col] = true;
				produces[col] = true;
			} else if(hasAny(card.text, [' mana of any color '])){
				produces[col] = true;
			}				
		});
		if(hasAny(card.text, [' Plains '])){
			produces[WHITE] = true;
		}
		if(hasAny(card.text, [' Island '])){
			produces[BLUE] = true;
		}
		if(hasAny(card.text, [' Swamp '])){
			produces[BLACK] = true;
		}
		if(hasAny(card.text, [' Mountain '])){
			produces[RED] = true;
		}
		if(hasAny(card.text, [' Forest '])){
			produces[GREEN] = true;
		}
		card.identity = identity;
		card.produces = produces;
	});
};
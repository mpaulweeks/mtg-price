var WHITE = 'W',
	BLUE = 'U',
	BLACK = 'B',
	RED = 'R',
	GREEN = 'G';
	
var colors = [WHITE,BLUE,BLACK,RED,GREEN];
module.exports.getColors = function(){
	return colors;
};
	
var hasAny = function(text, items){
	var result = false;
	items.forEach(function (i){
		if(text.indexOf(i) > -1){
			result = true;
		}
	});
	return result;
}
	
var calculateColors = function(cards){
	cards.forEach(function (card){
		var identity = {};
		var produces = {};
		colors.forEach(function (col){
			identity[col] = false;
			produces[col] = false;
			
			//edh
			if(hasAny(card.cost, [col])){
				identity[col] = true;
			}
			
			//lands
			var keywords = [
				'{' + col + '}',
				'/' + col + '}',
				'{' + col + '/'
			];
			if(hasAny(card.text, keywords)){
				identity[col] = true;
				produces[col] = true;
			} else if (hasAny(card.text, [' mana of any color '])
					|| hasAny(card.text, [' basic land '])){
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

var calculateEdhFilter = function(cards){
	cards.forEach(function (card){
		card.edh_filter = {
			'and': [],
			'or': [],
			'not': []
		};
		colors.forEach(function (col){
			if(!card.identity[col]){
				card.edh_filter['not'].push(col);
			}
		});
	});
};

var calculateBestPrice = function(cards){
	cards.forEach(function (c){
		var best_price;
		c.editions.forEach(function (ed){
			if (ed.hasOwnProperty('price')){
				var editionPrice = ed.price.median;
				if(!best_price || (best_price > editionPrice)){
					best_price = editionPrice;
				}
			}
		});
		c.best_price = best_price;
		c.best_price_str = '$' + (best_price / 100).toFixed(2);
	});
};
	
module.exports.updateCards = function(cards){
	calculateBestPrice(cards);
	calculateColors(cards);
	calculateEdhFilter(cards);
};
	
module.exports.updateCard = function(card){
	calculateBestPrice([card]);
	calculateColors([card]);
	calculateEdhFilter([card]);
};
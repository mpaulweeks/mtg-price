WHITE = 'W';
BLUE = 'U';
BLACK = 'B';
RED = 'R';
GREEN = 'G';
COLORLESS = '1';
	
var colors = [WHITE,BLUE,BLACK,RED,GREEN,COLORLESS];
module.exports.getColors = function(){
	return colors;
};

var formats = ["commander","legacy","modern","standard","vintage"];
module.exports.getFormats = function(){
	return formats;
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
			
			if(col === COLORLESS){
				if(card.text.match(/\{\d}/)){
					produces[COLORLESS] = true;
				}
				return; //dont do rest
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
		
		//edh
		if('colors' in card){
			card.colors.forEach(function (name){
				if(name === 'white'){
					identity[WHITE] = true;
				}
				if(name === 'blue'){
					identity[BLUE] = true;
				}
				if(name === 'black'){
					identity[BLACK] = true;
				}
				if(name === 'red'){
					identity[RED] = true;
				}
				if(name === 'green'){
					identity[GREEN] = true;
				}
			});
		}
					
		card.identity = identity;
		card.produces = produces;
		
		var identity_pretty = []
		colors.forEach(function (col){
			if(identity[col]){
				identity_pretty.push(col);
			}
		});
		if(identity_pretty.length === 0){
			identity_pretty.push('1');
		}
		card.identity_pretty = identity_pretty;
	});
};

var calculateEdhFilter = function(cards){
	cards.forEach(function (card){
		card.edh_filter = {
			'and': [],
			'or': [],
			'not': [],
			'format': 'commander'
		};
		colors.forEach(function (col){
			if(card.identity[col]){
				card.edh_filter['or'].push(col);
			} else {
				card.edh_filter['not'].push(col);
			}
			card.edh_filter['or'].push(COLORLESS);
		});
		card.edh_filter_json = JSON.stringify(card.edh_filter);
	});
};

var calculateBestPrice = function(cards){
	cards.forEach(function (c){
		var best_price;
		var image_url;
		c.editions.forEach(function (ed){
			if (ed.hasOwnProperty('price')){
				var editionPrice = ed.price.median;
				if(!best_price || (best_price > editionPrice)){
					best_price = editionPrice;
					image_url = ed.image_url;
				}
			}
		});
		c.best_price = best_price;
		c.best_price_str = '$' + (best_price / 100).toFixed(2);
		c.image_url = image_url;
	});
};
	
module.exports.updateCards = function(cards){
	calculateBestPrice(cards);
	calculateColors(cards);
	calculateEdhFilter(cards);
};
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
	
var calculateCleanText = function(cards){
	cards.forEach(function (c){		
		var clean = c.text;
		var i_colon = clean.indexOf(':');
		while(i_colon !== -1){
			var i_begin = clean.lastIndexOf('.', i_colon);
			clean = clean.slice(0, i_begin + 1) + clean.slice(i_colon + 1);
			i_colon = clean.indexOf(':');
		}
		c.text_clean = clean;
	});
};

var calculatePrettyText = function(cards){
	cards.forEach(function (c){
		var pretty = c.text;
		pretty = pretty.replace(/\{T}/gi, '<image src="http://mtgimage.com/symbol/other/t/16.gif" />');
		pretty = pretty.replace(/\{.\/.}/gi, function(str){ return str.slice(0,2)+str.slice(3); });
		pretty = pretty.replace(/\{/gi, '<image src="http://mtgimage.com/symbol/mana/');
		pretty = pretty.replace(/}/gi, '/16.gif" />');
		pretty = pretty.replace(/[\n]+/gi, '<br/>');
		c.text_pretty = pretty;
		c.text_pretty_big = pretty.replace(/\<br\/>/gi, '<br/><br/>');
	});
}
	
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
			
			if(hasAny(card.text_clean, [' mana of any color'])
			|| hasAny(card.text_clean, [' mana of any one color'])
			|| hasAny(card.text_clean, [' mana of any type'])
			|| hasAny(card.text_clean, [' mana of that color'])){
				produces[col] = true;
			}	
			
			if(col === COLORLESS){
				if(card.text_clean.match(/\{\d|X}/)){
					produces[COLORLESS] = true;
				}
				return; //dont do rest
			}
			
			if (hasAny(card.text_clean, [' basic land '])){
				produces[col] = true;
			}
			var keywords = [
				'{' + col + '}',
				'/' + col + '}',
				'{' + col + '/'
			];
			if(hasAny(card.text, keywords)){
				identity[col] = true;
			}			
			if(hasAny(card.text_clean, keywords)){
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
		
		var produces_anything = false;
		var identity_pretty = []
		colors.forEach(function (col){
			produces_anything = produces_anything || produces[col];
			if(identity[col]){
				identity_pretty.push(col);
			}			
		});
		card.produces_nothing = !produces_anything;
		
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
			if(card.identity[col] || col === COLORLESS){
				card.edh_filter['or'].push(col);
			} else {
				card.edh_filter['not'].push(col);
			}
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
	calculateCleanText(cards);
	calculatePrettyText(cards);
	calculateBestPrice(cards);
	calculateColors(cards);
	calculateEdhFilter(cards);
};
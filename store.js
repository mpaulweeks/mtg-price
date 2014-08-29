var https = require('https');

module.exports.getUrl = function(url, callback){
	https.get(url, function(response){
		response.setEncoding('utf8');
		alldata = "";
		response.on('data', function(e) {
			alldata += e;
		});
		response.on('end', function(e) {
			callback(null, alldata);
		});
		response.on('error', function(e) {
			callback(e);
		});
	});
}
var fs = require('fs');
var path = require('path');
module.exports.getCache = function(key) {
	var str = fs.readFileSync(cacheFile, 'utf8').toString();
	try {
		cache = JSON.parse(str);
	} catch (e) {
		
	}
	return cache[key];
}

module.exports.putCache = function(key, value) {
	cache[key] = value;
	fs.writeFileSync(cacheFile, JSON.stringify(cache));
}

var cacheFile = path.join(__dirname, 'data', 'cache.json');
var cache = {};

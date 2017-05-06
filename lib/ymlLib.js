var YAML = require('yamljs');
module.exports.parse = function(str) {
	return YAML.parse(str);
}
module.exports.stringify = function(obj) {
	return YAML.stringify(obj, 6, 2);
}
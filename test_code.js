var getStringBetween = function(chunk, startkey, endkey) {
	var startIndex = -1;
	var endIndex = -1;
	if((startIndex = chunk.indexOf(startkey)) != -1) {
		chunk = chunk.substring(startIndex + startkey.length);
		if((endIndex = chunk.indexOf(endkey)) != -1) {
			return chunk.substring(0, chunk.indexOf(endkey));
		}
		else {
			return null;
		}
	}
	return null;
}

var isOnlyOneVariable = function(c) {
	if(c.indexOf('##') == 0 && c.lastIndexOf('##') == c.length - 2) {
		var test = getStringBetween(c, '##','##')
		if(test.length == c.length - 4) {
			return true;
		}
	}
	return false;
}
var a = '##test##'
var b = '##test## ##abc##';

isOnlyOneVariable(a)
isOnlyOneVariable(b)

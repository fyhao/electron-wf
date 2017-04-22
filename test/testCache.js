var assert = require('assert');
var stepModule = require('../workflow_engine.js');
global.ProjRequire = function(module) {
	return require(__dirname + '/../' + module);
}
var cache = ProjRequire('cache.js');
describe('cache.js', function() {
  this.timeout(15000);
  var d = new Date().toString();
  describe('cache get/set', function() {
	it('should able to set the cache', function() {
		cache.putCache('TestKey', 'd' + d);
    });
	
	it('should able to get the cache', function() {
		var value = cache.getCache('testKey');
		assert(true, value === 'd' + d);
    });
  });
});
var assert = require('assert');
var stepModule = require('../step.js');
global.ProjRequire = function(module) {
	return require(__dirname + '/../' + module);
}

describe('step.js', function() {
  describe('bootstrap', function() {
    it('should run without error', function() {
      stepModule.bootstrap();
    });
  });
});
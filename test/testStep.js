var assert = require('assert');
global.ProjRequire = function(module) {
	return require(__dirname + '/../' + module);
}

describe('tests.js', function() {
  describe('tests', function() {
	this.timeout(15000);
	var testsModule = null;
    it('should able to initialize properly', function() {
		testsModule = require('../tests.js');
    });
	it('should able to load a config', function() {
		var configFile = __dirname + '/../examples/milestone_1/milestone_1.wf';
		testsModule.loadConfig(configFile);
    });
  });
});
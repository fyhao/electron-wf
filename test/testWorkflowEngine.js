var assert = require('assert');
var stepModule = require('../workflow_engine.js');
global.ProjRequire = function(module) {
	return require(__dirname + '/../' + module);
}
var workflowModule = ProjRequire('./workflow_engine.js');

// BOOTSTRAPPING STEP MODULE
var stepModule = ProjRequire('./step.js');
describe('workflow_engine.js', function() {
  describe('bootstrap', function() {
	this.timeout(15000);
    it('should run without error', function() {
		workflowModule.setStepModule(stepModule);
    });
  });
});
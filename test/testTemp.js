var path = require('path');
var assert = require('assert');
var stepModule = require('../workflow_engine.js');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}
var workflowModule = ProjRequire('./workflow_engine.js');
// initializing
workflowModule.setWindow({webContents:{send:function(a,b) {}}});

// BOOTSTRAPPING STEP MODULE
var stepModule = ProjRequire('./step.js');
describe('workflow_engine.js', function() {
  this.timeout(15000);
  
  describe('__dirname variable', function() {
	it('should able to show __dirname variable', function(done) {
		var configFile = '../examples/milestone_6/issue_92/testDirname.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			done();
		});	
    });
  });
});
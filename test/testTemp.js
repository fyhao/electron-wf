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
  
  describe('__dirnvar config = workflowModule.importConfig(configFile);ame variable', function() {
	it('should able to show __dirname variable', function(done) {
		console.log(__dirname)
		var configFile = './examples/milestone_6/issue_92/testDirname.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			done();
		});	
    });
  });
});
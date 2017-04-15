var assert = require('assert');
var stepModule = require('../workflow_engine.js');
global.ProjRequire = function(module) {
	return require(__dirname + '/../' + module);
}
var workflowModule = ProjRequire('./workflow_engine.js');
// initializing
workflowModule.setWindow({webContents:{send:function(a,b) {}}});

// BOOTSTRAPPING STEP MODULE
var stepModule = ProjRequire('./step.js');
describe('workflow_engine.js', function() {
  this.timeout(15000);
  describe('bootstrap', function() {
    it('set Step module', function() {
		workflowModule.setStepModule(stepModule);
    });
  });
  
  describe('http.wf', function() {
	it('should able to perform http operation', function(done) {
		var configFile = '../examples/milestone_2/issue_14/http.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		var config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestHttp'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('copyFolder.wf', function() {
	it('should able to copy folder', function(done) {
		var configFile = '../examples/milestone_2/issue_4/copyFolder.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['PerformWork'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('wait.wf', function() {
	it('should able to wait', function(done) {
		var configFile = '../examples/milestone_2/issue_15/wait.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestWait'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
});
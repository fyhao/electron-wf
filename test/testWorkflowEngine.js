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
    it('set Step module', function() {
		workflowModule.setStepModule(stepModule);
    });
	it('test http.wf', function(done) {
		var configFile = '../examples/milestone_2/issue_14/http.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.setWindow({webContents:{send:function(a,b) {}}});
		workflowModule.executeWorkFlow(config.workFlows['TestHttp'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
});
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
  
  describe('listFiles', function() {
	it('should able to list files', function(done) {
		var config = {
			
			workFlows : {
				TestCase:{
					steps : [
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result',filter:'b'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:2, actual:'##len##'},
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result',filter:'1.txt',if:'endsWith'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:2, actual:'##len##'},
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:5, actual:'##len##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	it('should able to iterate the files in runLoop', function(done) {
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:5, actual:'##len##'},
						{type:'runLoop',array:'result',item:'item',wf:'eachItem'}
					]
				}
				,eachItem:{
					steps : [
						{type:'evaljs',var:'verified',code:'vars["item"].indexOf("first") > -1'},
						{type:'assert',expected:'1', actual:'##verified##'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
	});
  });
});
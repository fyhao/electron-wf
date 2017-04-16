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
  
  describe('file.wf', function() {
	var path = 'examples/milestone_5/issue_20';
	var wfFile = '../' + path + '/file.wf';
	var testFile = path + '/a.txt';
	it('should able to create and overwrite test file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileWrite'], {}, function() {
			var fs = require('fs');
			var con = fs.readFileSync(testFile).toString();
			assert.equal('1st line\r\n2nd linebbbccc\r\n', con);
			done();
		});
    });
	it('should able to create and append test file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileAppend'], {}, function() {
			var fs = require('fs');
			var con = fs.readFileSync(testFile).toString();
			assert.equal('init\r\n1st line\r\n2nd linebbbccc\r\n', con);
			done();
		});
    });
	it('should able to read file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileRead'], {}, function() {
			done();
		});
    });
	it('should able to copy file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileCopy'], {}, function() {
			done();
		});
    });
	it('should able to delete file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['DeleteFile'], {}, function() {
			var fs = require('fs');
			assert.equal(true, !fs.existsSync(testFile));
			done();
		});
    });
  });
  
  
  describe('excel.wf', function() {
	it('should able to open, read, write, save the Excel file', function(done) {
		var configFile = '../examples/milestone_5/issue_21/excel.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestExcel'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  describe('exec.wf', function() {
	it('should able to execute command prompt', function(done) {
		var configFile = '../examples/milestone_5/issue_23/exec.wf';
		var testDir = 'examples/milestone_5/issue_23/target';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestExec'], {}, function() {
			console.log('done');
			var fs = require('fs');
			assert.equal(true, fs.existsSync(testDir));
			done();
		});	
    });
  });
  
  describe('runExcelCase.wf', function() {
	it('should able to run Excel Test Case', function(done) {
		var configFile = '../examples/milestone_5/issue_22/runExcelCase.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestExcelCase'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
});
var path = require('path')
var assert = require('assert');
var fs = require('fs');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}
var yaml = ProjRequire('./lib/ymlLib.js');
describe('lib', function() {
  this.timeout(15000);
  
  describe('ymlLib', function() {
	  var sampleJson = {version:'1',flows:[
			{name:'flow1'},
			{name:'flow2',age:3,is:true,money:3.93},
			{name:'flow3',subflow1:{
				subflow2: {
				subflow3:{value:4}
				}
			}}
		]}	
		var str = null;
		var compare = function(a,b,fn) {
			var item_a = fn(a);
			var item_b = fn(b);
			return item_a == item_b;
		}
	it('should able to return a yml string from a json object', function(done) {	
		str = yaml.stringify(sampleJson);
		assert(str != null && str.length > 0, true);
		assert(str.indexOf('{') == -1 && str.indexOf('}') == -1, true);
		//console.log(str);
		done();
    });
	it('should able to return a json object from yml string', function(done) {	
		var json = yaml.parse(str);
		assert.equal(json != null, true);
		assert.equal(compare(sampleJson, json, function(item) { return item['version']}), true);
		assert.equal(compare(sampleJson, json, function(item) { return item['flows'].length}), true);
		assert.equal(compare(sampleJson, json, function(item) { return item['flows'][1]['name']}), true);
		assert.equal(compare(sampleJson, json, function(item) { return item['flows'][1]['age']}), true);
		assert.equal(compare(sampleJson, json, function(item) { return item['flows'][1]['is']}), true);
		assert.equal(compare(sampleJson, json, function(item) { return item['flows'][1]['money']}), true);
		done();
    });
	
  });
  describe('workflows', function() {
	 var workflowModule = ProjRequire('./workflow_engine.js');
	// initializing
	workflowModule.setWindow({webContents:{send:function(a,b) {}}});
	var configFile = './examples/milestone_6/issue_93/runExcelCase.wf';
	var ymlFile = './examples/milestone_6/issue_93/runExcelCase.yml';
	var con = null;
	it('should able to return a yml string from a standard workflow object', function(done) {
		var config = workflowModule.importConfig(configFile);
		assert.equal(config != null, true);
		var str = yaml.stringify(config);
		assert.equal(str != null && str.length > 0, true);
		assert.equal(str.indexOf('{') == -1 && str.indexOf('}') == -1, true);
		con = str;
		done();
    });
	it('should able to return a yml string from a YML workflow object', function(done) {
		//console.log('write con ' + con);
		fs.writeFileSync(ymlFile, con);
		assert.equal(fs.existsSync(ymlFile), true);
		var ymlConfig = workflowModule.importConfig(ymlFile);
		assert.equal(typeof ymlConfig != 'undefined', true);
		assert.equal(typeof ymlConfig.workFlows != 'undefined', true);
		var ymlStr = yaml.stringify(ymlConfig);
		assert.equal(ymlStr != null && ymlStr.length > 0, true);
		assert.equal(ymlStr.indexOf('{') == -1 && ymlStr.indexOf('}') == -1, true);
		done();
    });
  });
});
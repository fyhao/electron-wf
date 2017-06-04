var path = require('path');
var assert = require('assert');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}

describe('tests.js', function() {
  describe('tests', function() {
	this.timeout(15000);
	var testsModule = null;
    it('should able to initialize properly', function() {
		testsModule = require('../tests.js');
    });
	it('should able to load a config', function() {
		var configFile = path.join(__dirname, '/../examples/milestone_1/milestone_1.wf');
		testsModule.loadConfig(configFile);
    });
  });
  
  describe('step.js', function() {
	this.timeout(15000);
	var stepModule = null;
	it('should able to initialize properly', function() {
		stepModule = require('../step.js');
    });
	it('should pass for valid spec', function() {
		var spec = {type:'setVar', name:'test',value:'test'};
		stepModule.checkSpec(spec);
    });
	it('should pass silently for not exist spec', function() {
		var spec = {type:'setVarTest', name:'test',value:'test'};
		stepModule.checkSpec(spec);
    });
	it('should throw for did not have required field defined', function() {
		var spec = {type:'setVar', name:'test'};
		assert.throws(function() { stepModule.checkSpec(spec) }, Error, 'Error step did not have required field value');
    });
	it('should throw for missing spec', function() {
		var spec = {type:'incrementVarTest', name:'test'};
		assert.throws(function() { stepModule.checkSpec(spec) }, Error, 'Error spec function is missing for incrementVarTest');
    });
	it('should throw for spec not return something', function() {
		var spec = {type:'incrementVarTest2', name:'test'};
		assert.throws(function() { stepModule.checkSpec(spec) }, Error, 'Error spec function is missing for incrementVarTest');
    });
	it('should throw for missing process', function() {
		var spec = {type:'incrementVarTest3', name:'test'};
		assert.throws(function() { stepModule.checkSpec(spec) }, Error, 'Error spec function is missing for incrementVarTest');
    });
  });
});
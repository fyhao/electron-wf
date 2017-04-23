// IMPORT
var fs = require('fs');
var util = require('./lib/util.js');
var path = require('path');

module.exports = {
	bootstrap : function() {
		_bootstrap();
	}
	,
	processStep : function(ctx, step, next) {
		_processStep(ctx, step, next);
	}
	,
	checkSpec : function(step) {
		_checkSpec(step);
	}
};

// public variable
var stepDefinitions = [];

// CONSTANTS
var LIB_STEPS_PATH = "lib/steps";

// REGION _bootstrap
var _bootstrap = function() {
	// scan available folders for step definition files
	scanRootLevelFiles();
	scanFolders();
	scanNodeModules();
}
var scanRootLevelFiles = function() {
	var list = fs.readdirSync(path.join(__dirname, LIB_STEPS_PATH)); 
	list.forEach(function(filename) {
		if(filename.lastIndexOf('.js') > -1) {
			var filepath = './' + LIB_STEPS_PATH + '/' + filename;
			delete require.cache[require.resolve(filepath)]; // delete require cache
			var def = require(filepath);
			var name = filename.replace('.js', '');
			if(typeof stepDefinitions[name] !== 'undefined') {
				throw new Error('ERROR the step definition [' + name + '] exist');
			}
			stepDefinitions[name] = def;
		}
	});
}
var scanFolders = function() {
	var list = fs.readdirSync(path.join(__dirname, LIB_STEPS_PATH));
	list.forEach(function(folder) {
		if(folder.lastIndexOf('.js') === -1) {
			var filepath = './' + LIB_STEPS_PATH + '/' + folder + '/init.js';
			delete require.cache[require.resolve(filepath)]; // delete require cache
			var def = require(filepath);
			var name = folder;
			if(typeof stepDefinitions[name] !== 'undefined') {
				throw new Error('ERROR the step definition [' + name + '] exist');
			}
			stepDefinitions[name] = def;
		}
	});
}
var scanNodeModules = function() {
	//TODO
}
// ENDREGION _bootstrap
// REGION _checkSpec
var _checkSpec = function(step) {
	var pro = new StepProcessor({}, step, function() {});
	pro.checkSpec(step);
}
// ENDREGION _checkSpec
// REGION _processStep

var _processStep = function(ctx, step, next) {
	var pro = new StepProcessor(ctx, step, next);
	pro.process();
}
var StepProcessor = function(ctx, step, next) {
	this.ctx = ctx;
	this.step = step;
	
	var def = null;
	var spec = null;
	var init = function() {
		findDef();
		findSpec();
	}
	
	var findDef = function() {
		if(typeof stepDefinitions[step.type] !== 'undefined') {
			def = stepDefinitions[step.type];
		}
	}
	var findSpec = function() {
		if(def === null) return;
		if(typeof def.spec == 'undefined') {
			console.log('Error spec function is missing for ' + step.type);
			throw new Error("Error spec function is missing for " + step.type);
		}
		spec = def.spec();
		if(spec === null) {
			throw new Error("Spec is null");
		}
		if(typeof def.process === 'undefined') {
			console.log('Error process function is missing for ' + step.type);
			throw new Error('Error process function is missing for ' + step.type);
		}
	}
	var checkSpec = function(step) {
		if(spec === null) {
			return;
		}
		// checkRequired Fields
		spec.fields.forEach(function(field) {
			if(field.required) {
				if(typeof step[field.name] === 'undefined') {
					console.log('Error step did not have required field ' + field.name);
					throw new Error('Error step did not have required field ' + field.name);
				}
			}
		});
	}
	this.checkSpec = checkSpec;
	this.process = function() {
		if(def === null) {
			process.nextTick(next);
			return; // if def not found, silent exit
		}
		def.process(ctx, step, next);
	}
	init();
}

// ENDREGION _processStep
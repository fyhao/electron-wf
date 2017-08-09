var fs = require('fs-extra');
var path = require('path');
var cp = require('child_process');
var util = require('./lib/util.js');
var yaml = require('./lib/ymlLib.js');
var mainWin = null;
var config = null;
var stepModule = null;

var GLOBAL_LASTCONFIGFILE = null;

var checkWorkflowStepSpec = function(config) {
	try {
		if(typeof config.workFlows !== 'undefined') {
			var eachCheckSpec = function(step) {
				stepModule.checkSpec(step);
			};
			for(var key in config.workFlows) {
				var wf = config.workFlows[key];
				if(wf.steps && wf.steps.length) {
					wf.steps.forEach(eachCheckSpec);
				}
			}
		}
	} catch (e) {
		return false;
	}
	return true;
}


var loadPlugins = function(config) {
	if(config === null) return;
	if(typeof config.plugins !== 'undefined' && config.plugins.length) {
		config.plugins.forEach(function(filepath) {
			delete require.cache[require.resolve(filepath)];
			var cfg = require(filepath);
			// load cfg.plugins
			if(typeof cfg.plugins !== 'undefined' && cfg.plugins.length) {
				loadPlugins(cfg);
			}
			// load cfg.db
			if(typeof cfg.db !== 'undefined') {
				for(var key in cfg.db) {
					if(config.db.hasOwnProperty(key)) {
						dialog.showMessageBox({message:'There is duplicate db key [' + key + '] defined when loading plugin [' + filepath + '], the program will exit', buttons:['OK']});
						throw new Error('There is duplicate db key [' + key + '] defined when loading plugin [' + filepath + '], the program will exit');
					}
					// append db object into parent config
					config.db[key] = cfg.db[key];
				}
			}
			// load cfg.workFlows
			if(typeof cfg.workFlows !== 'undefined') {
				for(var key in cfg.workFlows) {
					if(config.workFlows.hasOwnProperty(key)) {
						dialog.showMessageBox({message:'There is duplicate workFlows key [' + key + '] defined when loading plugin [' + filepath + '], the program will exit', buttons:['OK']});
						throw new Error('There is duplicate workFlows key [' + key + '] defined when loading plugin [' + filepath + '], the program will exit');
					}
					// append workFlows object into parent config
					config.workFlows[key] = cfg.workFlows[key];
				}
			}
			if(!checkWorkflowStepSpec(config)) {
				util.alert("Error check step spec");
				return;
			}
		});
	}
}

var executeWorkFlow = function(wf, opts, donefn) {
	wf = util.clone(wf);
	if(typeof opts === 'undefined') var opts = {};
	var ctx = {};
	
	ctx.openFileWritesHandler = {};
	ctx.excelHandler = {};
	ctx.vars = {};
	ctx.mainWin = mainWin;
	ctx.executeWorkFlow = executeWorkFlow;
	ctx.config = config;
	ctx.opts = opts;
	
	if(typeof GLOBAL_LASTCONFIGFILE !== 'undefined') {
		ctx.vars['__dirname'] = path.dirname(GLOBAL_LASTCONFIGFILE);
	}
	else {
		ctx.vars['__dirname'] = __dirname;
	}
	
	
	if(typeof opts.inputVars !== 'undefined') {
		for(var i in opts.inputVars) {
			if(!Object.prototype.hasOwnProperty.call(opts.inputVars,i)) continue;
			ctx.vars[i] = opts.inputVars[i];
		}
	}
	var replaceVars = function(c) {
		if(util.isOnlyOneVariable(c)) {
			var varName = util.getStringBetween(c, '##','##')
			c = ctx.vars[varName]
		}
		else {
			for(var k in ctx.vars) {
				if(!Object.prototype.hasOwnProperty.call(ctx.vars,k)) continue;
				c = util.replaceAll(c, '##' + k + '##', ctx.vars[k]);
			}
		}
		return c;
	}
	var replaceVarsStep = function(step) {
		for(var i in step) {
			if(!Object.prototype.hasOwnProperty.call(step,i)) continue;
			if(typeof step[i] !== 'string') {
				step[i] = replaceVarsStep(step[i]);
			}
			else {
				step[i] = replaceVars(step[i]);
			}
		}
		return step;
	}
	var curStep = 0;
	var checkNext = function() {
		// execute next
		if(1 + curStep < wf.steps.length) {
			curStep++;
			process.nextTick(next);
		}
		else {
			var outputVars = {};
			if(typeof opts.outputVars !== 'undefined') {
				opts.outputVars.forEach(function(i) {
					outputVars[i] = ctx.vars[i];
				});
			}
			if(typeof opts.inputVars !== 'undefined' && typeof opts.inputVars.outputall !== 'undefined' &&  opts.inputVars.outputall) {
				for(var i in ctx.vars) {
					if(!Object.prototype.hasOwnProperty.call(ctx.vars,i)) continue;
					outputVars[i] = ctx.vars[i];
				}
			}
			if(donefn)process.nextTick(function() {
				donefn({outputVars:outputVars});
			});
			// garbage collection
			ctx.openFileWritesHandler = {};
			ctx.excelHandler = {};
			ctx.vars = {};
		}
	}
	var next = function() {
		var step = wf.steps[curStep];
		step = replaceVarsStep(step);
		
		// search available work flow
		if(typeof config.workFlows[step.type] !== 'undefined') {
			var inputVars = step;
			if(typeof step.inputall !== 'undefined' && step.inputall) {
				for(var i in ctx.vars) {
					if(!Object.prototype.hasOwnProperty.call(ctx.vars,i)) continue;
					inputVars[i] = ctx.vars[i];
				}
			}
			executeWorkFlow(config.workFlows[step.type], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
				if(outputOpts.outputVars) {
					for(var i in outputOpts.outputVars) {
						if(!Object.prototype.hasOwnProperty.call(outputOpts.outputVars,i)) continue;
						ctx.vars[i] = outputOpts.outputVars[i];
					}
				}
				process.nextTick(checkNext);
			});
		}
		else {
			stepModule.processStep(ctx, step, checkNext);
		}
	} // end next
	
	process.nextTick(next);
}
function setConfig(cfg) {
	config = cfg;
}
module.exports.executeWorkFlow = executeWorkFlow;
module.exports.setWindow = function(win) {
	mainWin = win;
}
module.exports.setConfig = setConfig;
module.exports.setStepModule = function(mod) {
	stepModule = mod;
}

module.exports.importConfig = function(configFile) {
	var config;
	if(configFile.endsWith('.yml')) {
		var str = fs.readFileSync(configFile,'utf8');
		config = yaml.parse(str);
	}
	else {
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
	}
	setConfig(config);
	// load plugins
	loadPlugins(config);
	/*
	if(!checkWorkflowStepSpec(config)) {
		util.alert("Error check step spec");
		return;
	}
	*/
	//console.log(configFile + "?" + config)
	GLOBAL_LASTCONFIGFILE = path.resolve(configFile);
	return config;
}
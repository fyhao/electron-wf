var fs = require('fs-extra');
var path = require('path');
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
	var isFinished = false;
	
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
			var varName = util.getStringBetween(c, '##','##');
			c = ctx.vars[varName];
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
	var copyVars = function(source, target) {
		for(var i in source) {
			if(!Object.prototype.hasOwnProperty.call(source, i)) continue;
			target[i] = source[i];
		}
	}
	var collectOutputVars = function() {
		var outputVars = {};
		if(typeof opts.outputVars !== 'undefined') {
			opts.outputVars.forEach(function(i) {
				outputVars[i] = ctx.vars[i];
			});
		}
		if(typeof opts.inputVars !== 'undefined' && typeof opts.inputVars.outputall !== 'undefined' && opts.inputVars.outputall) {
			copyVars(ctx.vars, outputVars);
		}
		return outputVars;
	}
	var finish = function(result) {
		if(isFinished) {
			return;
		}
		isFinished = true;
		if(donefn) process.nextTick(function() {
			donefn(result);
		});
		// garbage collection
		ctx.openFileWritesHandler = {};
		ctx.excelHandler = {};
		ctx.vars = {};
	}
	var curStep = 0;
	var checkNext = function(error) {
		if(error) {
			handleException(error);
			return;
		}
		// execute next
		if(1 + curStep < wf.steps.length) {
			curStep++;
			process.nextTick(next);
		}
		else {
			finish({outputVars:collectOutputVars()});
		}
	}
	var handleException = function(error) {
		if(typeof wf.onException === 'undefined' || typeof config.workFlows[wf.onException] === 'undefined') {
			finish({error:error});
			return;
		}
		ctx.vars.__exception__ = error.message || error.toString();
		ctx.vars.__exceptionStack__ = error.stack || '';
		var inputVars = {outputall:true};
		copyVars(ctx.vars, inputVars);
		executeWorkFlow(config.workFlows[wf.onException], {inputVars:inputVars, assert:ctx.opts.assert}, function(outputOpts) {
			if(outputOpts.error) {
				finish({error:outputOpts.error});
				return;
			}
			if(outputOpts.outputVars) {
				copyVars(outputOpts.outputVars, ctx.vars);
			}
			finish({outputVars:collectOutputVars()});
		});
	}
	var next = function() {
		try {
			var step = wf.steps[curStep];
			step = replaceVarsStep(step);
			
			// search available work flow
			if(typeof config.workFlows[step.type] !== 'undefined') {
				var inputVars = step;
				if(typeof step.inputall !== 'undefined' && step.inputall) {
					copyVars(ctx.vars, inputVars);
				}
				executeWorkFlow(config.workFlows[step.type], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
					if(outputOpts.error) {
						handleException(outputOpts.error);
						return;
					}
					if(outputOpts.outputVars) {
						copyVars(outputOpts.outputVars, ctx.vars);
					}
					process.nextTick(checkNext);
				});
			}
			else {
				stepModule.processStep(ctx, step, function(stepError) {
					if(stepError) {
						handleException(stepError);
						return;
					}
					checkNext();
				});
			}
		} catch (error) {
			handleException(error);
		}
	} // end next
	
	if(!wf.steps || !wf.steps.length) {
		finish({outputVars:collectOutputVars()});
		return;
	}
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

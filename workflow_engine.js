var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var util = require('./lib/util.js');
var Excel = require('exceljs');
var sql = require('mssql');
var xml2js = require('xml2js')
var mainWin = null;
var config = null;
var stepModule = null;


var executeWorkFlow = function(wf, opts, donefn) {
	wf = util.clone(wf);
	if(typeof opts == 'undefined') var opts = {};
	var ctx = {};
	
	ctx.openFileWritesHandler = {};
	ctx.excelHandler = {};
	ctx.vars = {};
	ctx.mainWin = mainWin;
	ctx.executeWorkFlow = executeWorkFlow;
	ctx.config = config;
	ctx.opts = opts;
	
	if(typeof opts.inputVars != 'undefined') {
		for(var i in opts.inputVars) {
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
				c = util.replaceAll(c, '##' + k + '##', ctx.vars[k]);
			}
		}
		return c;
	}
	var replaceVarsStep = function(step) {
		for(var i in step) {
			if(typeof step[i] != 'string') {
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
			if(typeof opts.outputVars != 'undefined') {
				opts.outputVars.forEach(function(i) {
					outputVars[i] = ctx.vars[i];
				});
			}
			if(typeof opts.inputVars != 'undefined' && typeof opts.inputVars.outputall != 'undefined' &&  opts.inputVars.outputall) {
				for(var i in ctx.vars) {
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
		if(typeof config.workFlows[step.type] != 'undefined') {
			var inputVars = step;
			if(typeof step.inputall != 'undefined' && step.inputall) {
				for(var i in ctx.vars) {
					inputVars[i] = ctx.vars[i];
				}
			}
			executeWorkFlow(config.workFlows[step.type], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
				if(outputOpts.outputVars) {
					for(var i in outputOpts.outputVars) {
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

module.exports.executeWorkFlow = executeWorkFlow;
module.exports.setWindow = function(win) {
	mainWin = win;
}
module.exports.setConfig = function(cfg) {
	config = cfg;
}
module.exports.setStepModule = function(mod) {
	stepModule = mod;
}
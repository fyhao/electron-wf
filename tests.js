const {app, BrowserWindow, Menu, dialog} = require('electron')

var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var util = require('./lib/util.js');
var Excel = require('exceljs');
var sql = require('mssql');
var xml2js = require('xml2js')
var config = null;
var excelFile = null;
global.ProjRequire = function(module) {
	return require(__dirname + '/' + module);
}
 
var initTestDataPrep = function(cfg, donefn) {
	var excelFile = cfg.testDataExcelFile;
	var workbook = new Excel.Workbook();
	workbook.xlsx.readFile(excelFile)
		.then(function() {
			var ws = workbook.getWorksheet(cfg.sheet);
			var startRow = cfg.startRow;
			var curRow = startRow;
			var firstCell = cfg.cells[0];
			var firstVal = null;
		
			var sql_list = [];
			
			// PRE PROCESS
			var crm_template = null;
			var crm_issue_template = null;
			var crm_issue_entries = [];
			if(cfg.crm != null) {
				crm_template = fs.readFileSync(cfg.crm_input_template).toString();
				crm_issue_template = util.getStringBetween(crm_template, "##START##", "##END##");
			}
			
			// PROCESS EACH ROW
			while((firstVal = util.fetchValue(ws, firstCell + curRow)) != null) {
				var cellData = {};
				cfg.cells.forEach(function(c) {
					var val = util.fetchValue(ws, c + curRow);
					if(util.in_array(c, cfg.dateCells)) {
						var date = new Date(val);
						if(!isNaN(date.getTime())) {
							val = date.toISOString().substring(0, 10) + ' ' + date.toISOString().substring(11, 19);
						}
					}
					cellData[c] = val;
				});
				if(cfg.db != null) {
					cfg.sql_templates.forEach(function(s) {
						for(var c in cellData) {
							var val = cellData[c];
							s = util.replaceAll(s, '##' + c + '##', val);
						}
						sql_list.push(s);
					});
				}
				curRow++;
			}
			
			// END PROCESS EACH ROW
			
			// POST PROCESS
			if(cfg.db != null) {	
				var connection1 = new sql.Connection(config.db[cfg.db], function(err) {
					if(err) {
						console.log('error: ');
						console.err(err);
						process.nextTick(next);
						return;
					}
					var sql_list_i = 0;
					var next = function() {
						var i = sql_list[sql_list_i];
						var request = new sql.Request(connection1);
						console.log('SQL: ' + i);
						request.query(i, function(err, recordset) {
							if(err) {
								console.dir(err); return;
							}
							if(++sql_list_i < sql_list.length) {
								process.nextTick(next);
							}
							else {
								if(donefn) process.nextTick(donefn);
							}
						});
					}
					process.nextTick(next);
				});
			}
			
		});
	
}
 

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
		// execute step
		if(step.type == 'testDataPrep') {
			initTestDataPrep(ctx.testDataPrep[step.name], checkNext);
		}
		else if(step.type == 'subflow') {
			executeWorkFlow(config.workFlows[step.name], {inputVars:step.inputVars,outputVars:step.outputVars}, function(outputOpts) {
				if(outputOpts.outputVars) {
					for(var i in outputOpts.outputVars) {
						ctx.vars[i] = outputOpts.outputVars[i];
					}
				}
				process.nextTick(checkNext);
			});
		}
		else {
			// search available work flow
			if(typeof config.workFlows[step.type] != 'undefined') {
				var inputVars = step;
				if(typeof step.inputall != 'undefined' && step.inputall) {
					for(var i in ctx.vars) {
						inputVars[i] = ctx.vars[i];
					}
				}
				executeWorkFlow(config.workFlows[step.type], {inputVars:inputVars,outputVars:step.outputVars}, function(outputOpts) {
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
		}
	} // end next
	
	process.nextTick(next);
}

var loadPlugins = function(config) {
	if(typeof config.plugins != 'undefined' && config.plugins.length) {
		config.plugins.forEach(function(filepath) {
			delete require.cache[require.resolve(filepath)];
			var cfg = require(filepath);
			// load cfg.plugins
			if(typeof cfg.plugins != 'undefined' && cfg.plugins.length) {
				loadPlugins(cfg);
			}
			// load cfg.db
			if(typeof cfg.db != 'undefined') {
				for(var key in cfg.db) {
					if(config.db.hasOwnProperty(key)) {
						dialog.showMessageBox({message:'There is duplicate db key [' + key + '] defined when loading plugin [' + filepath + '], the program will exit', buttons:['OK']});
						process.exit(0);
						return;
					}
					// append db object into parent config
					config.db[key] = cfg.db[key];
				}
			}
			// load cfg.workFlows
			if(typeof cfg.workFlows != 'undefined') {
				for(var key in cfg.workFlows) {
					if(config.workFlows.hasOwnProperty(key)) {
						dialog.showMessageBox({message:'There is duplicate workFlows key [' + key + '] defined when loading plugin [' + filepath + '], the program will exit', buttons:['OK']});
						process.exit(0);
						return;
					}
					// append workFlows object into parent config
					config.workFlows[key] = cfg.workFlows[key];
				}
			}
		});
	}
}


// BOOTSTRAPPING STEP MODULE
var stepModule = require('./step.js');
stepModule.bootstrap();

module.exports.reloadConfig = function() {
	loadConfig(lastConfigFile);
}

module.exports.setWindow = function(win) {
	mainWin = win;
}
var lastConfigFile = null;
module.exports.loadConfig = function loadConfig(configFile) {
	lastConfigFile = configFile;
	delete require.cache[require.resolve(configFile)]; // delete require cache
	config = require(configFile); // require again
	// load plugins
	loadPlugins(config);
	excelFile = config.testDataExcelFile;
	var testDataPrepMenus = [];
	for(var i in config.testDataPrep) {
		testDataPrepMenus.push({
			label : 'Initialize Test Data for ' + i, i:i,click:function(item,win) {
				initTestDataPrep(config.testDataPrep[item.i]);	
			}
		});
	}
	module.exports.menu = testDataPrepMenus;
	
	var workFlowMenus = [];
	for(var i in config.workFlows) {
		if(!config.workFlows[i].showInMenu) continue;
		workFlowMenus.push({
			label : 'Execute WorkFlow for ' + i, i:i,click:function(item,win) {
				mainWin.webContents.send('wfevt', {action:'startWorkflow',wfname:item.i});
				executeWorkFlow(config.workFlows[item.i]);	
			}
		});
	}
	module.exports.workFlowMenu = workFlowMenus;
}
module.exports.getConfigObj = function() {return config;}
var mainWin = null;
//initTestDataPrep(config.testDataPrep.CRM);
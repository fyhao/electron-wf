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
		if(step.type == 'log') {
			console.log(step.log);
			mainWin.webContents.send('wfevt', {action:'log',item:{log:step.log}});
			process.nextTick(checkNext);
		}
		else if(step.type == 'exec') {
			console.log('Exec ' + step.cmd);
			cp.exec(step.cmd, function(err, stdout, stderr) {
				console.log('err ' + err);
				console.log('stdout ' + stdout);
				console.log('stderr ' + stderr);
				ctx.vars['execStdout'] = stdout;
				ctx.vars['execStderr'] = stderr;
				process.nextTick(checkNext);
			});
		}
		else if(step.type == 'setVar') {
			ctx.vars[step.name] = step.value;
			process.nextTick(checkNext);
		}
		else if(step.type == "incrementVar") {
			try {
				ctx.vars[step.name] = parseInt(ctx.vars[step.name]) + 1;
			} catch (e) {
				console.log(e);
			}
			process.nextTick(checkNext);
		}
		else if(step.type == 'util.replaceAll') {
			ctx.vars[step.var] = util.replaceAll(step.source, step.from, step.to);
			process.nextTick(checkNext);
		}
		else if(step.type == 'if') {
			var val = ctx.vars[step.var];
			var validated = false;
			if(step.if == 'contains') {
				validated = val.indexOf(step.pattern) != -1;
			}
			else if(step.if == 'equal') {
				//console.log('execute if [' + val + '] = [' + step.pattern + ']');
				validated = val == step.pattern;
			}
			else if(step.if == 'eq') {
				//console.log('execute if [' + val + '] = [' + step.pattern + ']');
				validated = val == step.pattern;
			}
			else if(step.if == 'neq') {
				//console.log('execute if [' + val + '] = [' + step.pattern + ']');
				validated = val != step.pattern;
			}
			if(validated) {
				if(step.yes_subflow != null) {
					var inputVars = step;
					for(var i in ctx.vars) {
						inputVars[i] = ctx.vars[i];
					}
					inputVars['inputall'] = true;
					inputVars['outputall'] = true;
					executeWorkFlow(config.workFlows[step.yes_subflow], {inputVars:inputVars,outputVars:step.yes_outputVars}, function(outputOpts) {
						if(outputOpts.outputVars) {
							for(var i in outputOpts.outputVars) {
								ctx.vars[i] = outputOpts.outputVars[i];
							}
						}
						process.nextTick(checkNext);
					});
				}
				else {
					process.nextTick(checkNext);
				}
			}
			else {
				if(step.no_subflow != null) {
					var inputVars = step;
					for(var i in ctx.vars) {
						inputVars[i] = ctx.vars[i];
					}
					inputVars['inputall'] = true;
					inputVars['outputall'] = true;
					executeWorkFlow(config.workFlows[step.no_subflow], {inputVars:inputVars,outputVars:step.no_outputVars}, function(outputOpts) {
						if(outputOpts.outputVars) {
							for(var i in outputOpts.outputVars) {
								ctx.vars[i] = outputOpts.outputVars[i];
							}
						}
						process.nextTick(checkNext);
					});
				}
				else {
					process.nextTick(checkNext);
				}
			}
		}
		else if(step.type == 'testDataPrep') {
			initTestDataPrep(config.testDataPrep[step.name], checkNext);
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
		else if(step.type == 'copyFile') {
			if(fs.existsSync(step.source)) {
				var stream = fs.createReadStream(step.source).pipe(fs.createWriteStream(step.target));
				stream.on('finish', function () { process.nextTick(checkNext); });
			}
			else {
				process.nextTick(checkNext);
			}
		}
		else if(step.type == 'copyFolder') {
			if(fs.existsSync(step.source)) {
				util.copyFolderRecursiveSync(step.source, step.target);
				process.nextTick(checkNext);
			}
			else {
				process.nextTick(checkNext);
			}
		}
		else if(step.type == 'createFolder') {
			fs.mkdirSync(step.folder);
			process.nextTick(checkNext);
		}
		else if(step.type == 'deleteFolder') {
			util.deleteFolderRecursive(step.folder);
			process.nextTick(checkNext);
		}
		else if(step.type == 'deleteFile') {
			if(fs.existsSync(step.file))
			fs.unlinkSync(step.file);
			process.nextTick(checkNext);
		}
		else if(step.type == 'openFileRead') {
			ctx.vars[step.var] = fs.readFileSync(step.file);
			process.nextTick(checkNext);
		}
		else if(step.type == 'openFileWrite') {
			ctx.openFileWritesHandler[step.name] = '';
			process.nextTick(checkNext);
		}
		else if(step.type == 'appendFileWrite') {
			ctx.openFileWritesHandler[step.name] += step.content;
			process.nextTick(checkNext);
		}
		else if(step.type == 'printlnFileWrite') {
			ctx.openFileWritesHandler[step.name] += step.content + "\r\n";
			process.nextTick(checkNext);
		}
		else if(step.type == 'closeFileWrite') {
			if(step.append) {
				fs.appendFileSync(step.file, ctx.openFileWritesHandler[step.name].toString());
			}
			else {
				fs.writeFileSync(step.file, ctx.openFileWritesHandler[step.name].toString());
			}
			ctx.openFileWritesHandler[step.name] = '';
			process.nextTick(checkNext);
		}
		else if(step.type == 'openExcel') {
			var workbook = new Excel.Workbook();
			workbook.xlsx.readFile(step.file)
				.then(function() {
					ctx.excelHandler[step.name] = workbook;
					process.nextTick(checkNext);
				});
		}
		else if(step.type == 'readExcelCell') {
			var wb = ctx.excelHandler[step.name];
			var ws = wb.getWorksheet(step.sheet);
			ctx.vars[step.var] = ws.getCell(step.cell).value;
			process.nextTick(checkNext);
		}
		else if(step.type == 'writeExcelCell') {
			var wb = ctx.excelHandler[step.name];
			var ws = wb.getWorksheet(step.sheet);
			ws.getCell(step.cell).value = step.value;
			process.nextTick(checkNext);
		}
		else if(step.type == 'saveExcel') {
			var wb = ctx.excelHandler[step.name];
			wb.xlsx.writeFile(step.file)
			.then(function() {
				process.nextTick(checkNext);
			});
		}
		else if(step.type == 'runExcelCase') {
			var workbook = new Excel.Workbook();
			workbook.xlsx.readFile(step.file)
				.then(function() {
					var ws = workbook.getWorksheet(step.sheet);
					var row = step.startRow;
					var val = null;
					var updateCellValue = function(cell, value) {
						ws.getCell(cell).value = value;
					}
					var checkExcelNext = function() {
						if((val = util.fetchValue(ws, 'A' + row)) != null) {
							var inputstep = step;
							inputstep.row = row;
							executeWorkFlow(config.workFlows[step.wf], {inputVars:inputstep,outputVars:step.outputVars,ws:ws,row:row,updateCellValue:updateCellValue}, function(outputOpts) {
								if(outputOpts.outputVars) {
									for(var i in outputOpts.outputVars) {
										vars[i] = outputOpts.outputVars[i];
									}
								}
								row++;
								process.nextTick(checkExcelNext);
							});
						}
						else {
							// done
							if(typeof step.savefile != 'undefined') {
								workbook.xlsx.writeFile(step.savefile)
								.then(function() {
									process.nextTick(checkNext);
								});
							}
							else {
								process.nextTick(checkNext);
							}
						}
					}
					process.nextTick(checkExcelNext);
				});
		}
		else if (step.type == 'wsread') {
			if(typeof opts.ws != 'undefined') {
				var val = util.fetchValue(opts.ws, step.col + opts.row);
				ctx.vars[step.var] = val;
			}
			process.nextTick(checkNext);
		}
		else if (step.type == 'wsupdate') {
			if(typeof opts.ws != 'undefined') {
				var toUpdate = true;
				if(typeof step.if != 'undefined') {
					var val = vars[step.ifvar];
					var validated = false;
					if(step.if == 'contains') {
						validated = val.indexOf(step.pattern) != -1;
					}
					else if(step.if == 'equal') {
						validated = val == step.pattern;
					}
					else if(step.if == 'eq') {
						validated = val == step.pattern;
					}
					else if(step.if == 'neq') {
						validated = val != step.pattern;
					}
					toUpdate = validated;
				}
				if(toUpdate) {
					opts.updateCellValue(step.col + opts.row, step.value);
				}
			}
			process.nextTick(checkNext);
		}
		else if(step.type == 'sql') {
			var connection1 = new sql.Connection(config.db[step.ds], function(err) {
				if(err) {
					console.log('Error');
					console.log(err);
					process.nextTick(checkNext)
					return
				}
				var request = new sql.Request(connection1);
				request.query(step.sql, function(err, recordset) {
					if(err) {
						console.dir(err);
						return;
					}
					//console.log(recordset);
					//console.log(step.recordsets);
					if(step.recordsets && step.recordsets.length) {
						recordset.forEach(function(i) {
							step.recordsets.forEach(function(j) {
								if(typeof i[j] != 'undefined') {
									ctx.vars[j] = i[j];
								}
							});
						});
					}
					process.nextTick(checkNext);
				});			
			});
		}
		else if(step.type == 'xml') {
			var parser = new xml2js.Parser();
			fs.readFile(step.file, function(err, data) {
				parser.parseString(data, function(err1, result) {
					ctx.vars[step.var] = result;
					console.log(result);
					process.nextTick(checkNext);
				});
			});
		}
		else if(step.type == 'evaljs') {
			var val = eval('vars = ' + JSON.stringify(ctx.vars) + '; ' + step.code);
			ctx.vars[step.var] = val;
			process.nextTick(checkNext);
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
				// TODO TEMP
				stepModule.processStep({}, step, checkNext);
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
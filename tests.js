const {app, BrowserWindow, Menu, dialog} = require('electron')

var fs = require('fs');
var cp = require('child_process');
var Excel = require('exceljs');
var sql = require('mssql');
var xml2js = require('xml2js')
var config = null;
var excelFile = null;


var replaceAll = function(s, n,v) {
	while(s.indexOf(n) != -1) {
		s = s.replace(n,v);
	}
	return s;
}
var fetchValue = function(ws,cell) {
	var val = ws.getCell(cell).value;
	if(val != null) {
		if(val.result != null) {
			val = val.result;
		}
		
		return val;
	}
	return null;
}
var in_array = function(item, arr) {
	var matched = false;
	arr.forEach(function(i) {
		if(item == i) matched = true;
	});
	return matched;
}
var getStringBetween = function(chunk, startkey, endkey) {
	var startIndex = -1;
	var endIndex = -1;
	if((startIndex = chunk.indexOf(startkey)) != -1) {
		chunk = chunk.substring(startIndex + startkey.length);
		if((endIndex = chunk.indexOf(endkey)) != -1) {
			return chunk.substring(0, chunk.indexOf(endkey));
		}
		else {
			return null;
		}
	}
	return null;
}
var isOnlyOneVariable = function(c) {
	if(c.indexOf('##') == 0 && c.lastIndexOf('##') == c.length - 2) {
		var test = getStringBetween(c, '##','##')
		if(test.length == c.length - 4) {
			return true;
		}
	}
	return false;
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
				crm_issue_template = getStringBetween(crm_template, "##START##", "##END##");
			}
			
			// PROCESS EACH ROW
			while((firstVal = fetchValue(ws, firstCell + curRow)) != null) {
				var cellData = {};
				cfg.cells.forEach(function(c) {
					var val = fetchValue(ws, c + curRow);
					if(in_array(c, cfg.dateCells)) {
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
							s = replaceAll(s, '##' + c + '##', val);
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
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
function clone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}
var executeWorkFlow = function(wf, opts, donefn) {
	wf = clone(wf);
	if(typeof opts == 'undefined') var opts = {};
	
	var openFileWritesHandler = {};
	var excelHandler = {};
	var vars = {};
	if(typeof opts.inputVars != 'undefined') {
		for(var i in opts.inputVars) {
			vars[i] = opts.inputVars[i];
		}
	}
	var replaceVars = function(c) {
		if(isOnlyOneVariable(c)) {
			var varName = getStringBetween(c, '##','##')
			c = vars[varName]
		}
		else {
			for(var k in vars) {
				c = replaceAll(c, '##' + k + '##', vars[k]);
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
					outputVars[i] = vars[i];
				});
			}
			if(typeof opts.inputVars != 'undefined' && typeof opts.inputVars.outputall != 'undefined' &&  opts.inputVars.outputall) {
				for(var i in vars) {
					outputVars[i] = vars[i];
				}
			}
			if(donefn)process.nextTick(function() {
				donefn({outputVars:outputVars});
			});
			// garbage collection
			openFileWritesHandler = {};
			excelHandler = {};
			vars = {};
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
				vars['execStdout'] = stdout;
				vars['execStderr'] = stderr;
				process.nextTick(checkNext);
			});
		}
		else if(step.type == 'setVar') {
			vars[step.name] = step.value;
			process.nextTick(checkNext);
		}
		else if(step.type == "incrementVar") {
			try {
				vars[step.name] = parseInt(vars[step.name]) + 1;
			} catch (e) {
				console.log(e);
			}
			process.nextTick(checkNext);
		}
		else if(step.type == 'replaceAll') {
			vars[step.var] = replaceAll(step.source, step.from, step.to);
			process.nextTick(checkNext);
		}
		else if(step.type == 'if') {
			var val = vars[step.var];
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
					for(var i in vars) {
						inputVars[i] = vars[i];
					}
					inputVars['inputall'] = true;
					inputVars['outputall'] = true;
					executeWorkFlow(config.workFlows[step.yes_subflow], {inputVars:inputVars,outputVars:step.yes_outputVars}, function(outputOpts) {
						if(outputOpts.outputVars) {
							for(var i in outputOpts.outputVars) {
								vars[i] = outputOpts.outputVars[i];
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
					for(var i in vars) {
						inputVars[i] = vars[i];
					}
					inputVars['inputall'] = true;
					inputVars['outputall'] = true;
					executeWorkFlow(config.workFlows[step.no_subflow], {inputVars:inputVars,outputVars:step.no_outputVars}, function(outputOpts) {
						if(outputOpts.outputVars) {
							for(var i in outputOpts.outputVars) {
								vars[i] = outputOpts.outputVars[i];
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
						vars[i] = outputOpts.outputVars[i];
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
		else if(step.type == 'createFolder') {
			fs.mkdirSync(step.folder);
			process.nextTick(checkNext);
		}
		else if(step.type == 'deleteFolder') {
			deleteFolderRecursive(step.folder);
			process.nextTick(checkNext);
		}
		else if(step.type == 'deleteFile') {
			if(fs.existsSync(step.file))
			fs.unlinkSync(step.file);
			process.nextTick(checkNext);
		}
		else if(step.type == 'openFileRead') {
			vars[step.var] = fs.readFileSync(step.file);
			process.nextTick(checkNext);
		}
		else if(step.type == 'openFileWrite') {
			openFileWritesHandler[step.name] = '';
			process.nextTick(checkNext);
		}
		else if(step.type == 'appendFileWrite') {
			openFileWritesHandler[step.name] += step.content;
			process.nextTick(checkNext);
		}
		else if(step.type == 'printlnFileWrite') {
			openFileWritesHandler[step.name] += step.content + "\r\n";
			process.nextTick(checkNext);
		}
		else if(step.type == 'closeFileWrite') {
			if(step.append) {
				fs.appendFileSync(step.file, openFileWritesHandler[step.name].toString());
			}
			else {
				fs.writeFileSync(step.file, openFileWritesHandler[step.name].toString());
			}
			openFileWritesHandler[step.name] = '';
			process.nextTick(checkNext);
		}
		else if(step.type == 'openExcel') {
			var workbook = new Excel.Workbook();
			workbook.xlsx.readFile(step.file)
				.then(function() {
					excelHandler[step.name] = workbook;
					process.nextTick(checkNext);
				});
		}
		else if(step.type == 'readExcelCell') {
			var wb = excelHandler[step.name];
			var ws = wb.getWorksheet(step.sheet);
			vars[step.var] = ws.getCell(step.cell).value;
			process.nextTick(checkNext);
		}
		else if(step.type == 'writeExcelCell') {
			var wb = excelHandler[step.name];
			var ws = wb.getWorksheet(step.sheet);
			ws.getCell(step.cell).value = step.value;
			process.nextTick(checkNext);
		}
		else if(step.type == 'saveExcel') {
			var wb = excelHandler[step.name];
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
						if((val = fetchValue(ws, 'A' + row)) != null) {
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
				var val = fetchValue(opts.ws, step.col + opts.row);
				vars[step.var] = val;
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
									vars[j] = i[j];
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
					vars[step.var] = result;
					console.log(result);
					process.nextTick(checkNext);
				});
			});
		}
		else if(step.type == 'evaljs') {
			var val = eval('vars = ' + JSON.stringify(vars) + '; ' + step.code);
			vars[step.var] = val;
			process.nextTick(checkNext);
		}
		else {
			// search available work flow
			if(typeof config.workFlows[step.type] != 'undefined') {
				var inputVars = step;
				if(typeof step.inputall != 'undefined' && step.inputall) {
					for(var i in vars) {
						inputVars[i] = vars[i];
					}
				}
				executeWorkFlow(config.workFlows[step.type], {inputVars:inputVars,outputVars:step.outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var i in outputOpts.outputVars) {
							vars[i] = outputOpts.outputVars[i];
						}
					}
					process.nextTick(checkNext);
				});
			}
			else {
				process.nextTick(checkNext);
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
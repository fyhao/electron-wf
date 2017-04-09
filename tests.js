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

var workflowModule = ProjRequire('./workflow_engine.js');

// BOOTSTRAPPING STEP MODULE
var stepModule = require('./step.js');
stepModule.bootstrap();
workflowModule.setStepModule(stepModule);

module.exports.reloadConfig = function() {
	loadConfig(lastConfigFile);
}

module.exports.setWindow = function(win) {
	mainWin = win;
	workflowModule.setWindow(mainWin);

}
var lastConfigFile = null;
module.exports.loadConfig = function loadConfig(configFile) {
	lastConfigFile = configFile;
	delete require.cache[require.resolve(configFile)]; // delete require cache
	config = require(configFile); // require again
	workflowModule.setConfig(config);
	// load plugins
	loadPlugins(config);
	excelFile = config.testDataExcelFile;
	var testDataPrepMenus = [];
	for(var i in config.testDataPrep) {
		testDataPrepMenus.push({
			label : 'Initialize Test Data for ' + i, i:i,click:function(item,win) {
				workflowModule.initTestDataPrep(config.testDataPrep[item.i]);	
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
				workflowModule.executeWorkFlow(config.workFlows[item.i]);	
			}
		});
	}
	module.exports.workFlowMenu = workFlowMenus;
}
module.exports.getConfigObj = function() {return config;}
var mainWin = null;
//initTestDataPrep(config.testDataPrep.CRM);
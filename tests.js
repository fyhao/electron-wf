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
	return require(path.join(__dirname, module));
}
var loadPlugins = function(config) {
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

var workflowModule = ProjRequire('./workflow_engine.js');

// BOOTSTRAPPING STEP MODULE
var stepModule = require('./step.js');
stepModule.bootstrap();
workflowModule.setStepModule(stepModule);

var checkWorkflowStepSpec = function(config) {
	try {
		if(typeof config.workFlows !== 'undefined') {
			for(var key in config.workFlows) {
				var wf = config.workFlows[key];
				if(wf.steps && wf.steps.length) {
					wf.steps.forEach(function(step) {
						stepModule.checkSpec(step);
					});
				}
			}
		}
	} catch (e) {
		return false;
	}
	return true;
}

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
	var config = workflowModule.importConfig(configFile);
	if(!checkWorkflowStepSpec(config)) {
		util.alert("Error check step spec");
		return;
	}
	// load plugins
	loadPlugins(config);
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
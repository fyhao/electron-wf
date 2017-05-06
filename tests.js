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
	var config = workflowModule.importConfig(configFile);
	
	
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
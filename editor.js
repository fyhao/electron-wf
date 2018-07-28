const {BrowserWindow, Menu, dialog, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
var fs = require('fs-extra');

var win;
module.exports.createEditWindow = function createEditWindow (input) {
  if(win != null) {
	  dialog.showMessageBox({message:'There is already an editor window opened', buttons:['OK']});
	  return;
  }
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'ui/edit.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.input = input;
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
  parseConfig(input.configFile);
}

var json = null;
var parseConfig = function(configFile) {
	var workflow = require('./tests.js');
	workflow.loadConfig(configFile);
	var config = workflow.getConfigObj();
	json = config;
	renderMenu();
}

var renderFileMenu = function() {
	return [
		{
			label:'Save',
			click:function() {
				dialog.showSaveDialog({}, function(filename) {
					if(typeof filename == 'undefined') {
						dialog.showMessageBox({message:'Failed to save',buttons:['OK']})
						return;
					}
					var con = JSON.stringify(json);
					con = 'module.exports = ' + con;
					fs.writeFileSync(filename,con);
					
				});
			}
		}
	];
}

var renderMenu = function() {
	
	var mainMenus = [];
	// File menu
	mainMenus.push({label:'File',submenu:renderFileMenu()});
	// db
	if(typeof json.db != 'undefined') {
		var menus = [];
		for(var key in json.db) {
			var menu = {label:key, key:key,item:json.db[key], click:function(i) {
				var item = i.item;
				console.log(item)
				win.webContents.send('cfg', json);
				win.webContents.send('editDB', {key:i.key,item:item});
			}}
			menus.push(menu);
		}
		mainMenus.push({
			label : 'DB',
			submenu:menus
		});
	}
	// workflows
	if(typeof json.workFlows != 'undefined') {
		var menus = [];
		for(var key in json.workFlows) {
			var menu = {label:key, key:key,item:json.workFlows[key], click:function(i) {
				var item = i.item;
				win.webContents.send('cfg', json);
				// add unique id for steps
				if(item.steps && item.steps.length) {
					for(var j = 0; j < item.steps.length; j++) {
						item.steps[j].id = Math.random();
					}
				}
				win.webContents.send('editWorkFlow', {key:i.key,item:item});
			}}
			menus.push(menu);
		}
		mainMenus.push({
			label : 'WorkFlows',
			submenu:menus
		});
	}
	var tempMenu = Menu.buildFromTemplate(mainMenus);
	win.setMenu(tempMenu);
	
}

ipcMain.on('saveEditDB', (event, arg) => {
   var key = arg.dbname;
   var item = arg.item;
   json.db[key] = item;
   renderMenu();
})
  
  
ipcMain.on('saveEditWF', (event, arg) => {
   var key = arg.key;
   var item = arg.item;
   console.log(item.steps)
   console.log('removing by ' + key)
   // remove unique id from steps
   if(item.steps && item.steps.length) {
		for(var i = 0; i < item.steps.length; i++) {
			delete item.steps[i].id 
			delete item.steps[i].$$hashKey;
		}
	}
	console.log(item.steps)
   json.workFlows[key] = item;
   renderMenu();
})
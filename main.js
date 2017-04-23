const {app, BrowserWindow, Menu, dialog} = require('electron')
const path = require('path')
const url = require('url');
const fs = require('fs');
const os = require('os');
var util = require('./lib/util.js');
var tests = require('./tests.js');
var editor = require('./editor.js');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var currentOpenedConfigFile = null;
function openWorkflowFile(template,configFile) {
	try {
		var workflow = require('./tests.js');
		workflow.loadConfig(configFile);
		
		var workflowMenus = [
		{
			label: 'Workflows',
			submenu : workflow.workFlowMenu
		}
		,
		{
			label : 'Refresh web',
			click:function() {
				win.loadURL(url.format({
					pathname: path.join(__dirname, 'ui/index.html'),
					protocol: 'file:',
					slashes: true
				  }))
			}
		}];
		var temp = util.clone(template);
		workflowMenus.forEach(function(i) {
			temp.push(i);
		});
		menu = Menu.buildFromTemplate(temp)
		win.setMenu(menu);
		currentOpenedConfigFile = configFile;
	} catch (e) {
		util.alert('Invalid properties file');
	}
}
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})
  tests.setWindow(win);
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'ui/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  
  
  // Open the DevTools.
  //win.webContents.openDevTools()
const template = [
	{
		label : 'File',
		submenu : [
			{
				label : 'Edit config',
				click : function() {
					dialog.showOpenDialog(function (fileNames) {
						if(typeof fileNames == 'undefined') return;
						var configFile;
						configFile = fileNames[0];
						var win = editor.createEditWindow({configFile:configFile});
					});
					
				}
			},
			{
				label : 'Load config',
				click : function() {
					dialog.showOpenDialog(function (fileNames) {
						if(typeof fileNames == 'undefined') return;
						var configFile;
						configFile = fileNames[0];
						openWorkflowFile(template, configFile)
						
					});
					
				}
			},
			{
				label : 'Generate run.bat/run.sh',
				click : function() {
					if(__dirname.indexOf('.asar') > -1) {
						var sourceDir = path.join(path.dirname(__dirname), '../');
						var sourceDirName = path.basename(sourceDir);
						var exePath = path.join(sourceDir, sourceDirName + '.exe');
						var batName = '';
						var plat = os.platform();
						if(plat.indexOf('win') > -1) {
							batName = 'run.bat';
						}
						else {
							batName = 'run.sh';
						}
						
						var batPath = path.join(path.dirname(currentOpenedConfigFile), batName);
						var content = '"' + exePath + '" "' + currentOpenedConfigFile + '"';
						if(fs.existsSync(batPath)) {
							fs.unlinkSync(batPath);
						}
						fs.writeFileSync(batPath, content);
						util.alert('Generated ' + batPath);
					}
				}
			}
		]
	}
];

var menu = Menu.buildFromTemplate(template)

Menu.setApplicationMenu(menu);


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
	app.quit();
  })
  
  
  
  
	if(process.argv.length == 2) {
		openWorkflowFile(template, process.argv[1]);
	}
	
	
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
	createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var path = require('path');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}
require('./testUtil.js');
require('./testLib.js');
require('./testStep.js');
require('./testWorkflowEngine.js');
//require('./testTemp.js');
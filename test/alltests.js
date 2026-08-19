var path = require('path');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}
require('./testUtil.js');
require('./testLib.js');
require('./testStep.js');
require('./testWorkflowEngine.js');
require('./testSelectFile.js');
require('./testCli.js');
require('./testParallel.js');
require('./testBufferedReader.js');
require('./testOracle.js');
require('./testMockSshServer.js');
//require('./testTemp.js');

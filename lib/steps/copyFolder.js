var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'copyFolder',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(fs.existsSync(step.source)) {
			util.copyFolderRecursiveSync(step.source, step.target);
			process.nextTick(checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}
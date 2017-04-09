var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'deleteFolder',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		util.deleteFolderRecursive(step.folder);
		process.nextTick(checkNext);
	}
}
var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'createFolder',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		fs.mkdirSync(step.folder);
		process.nextTick(checkNext);
	}
}
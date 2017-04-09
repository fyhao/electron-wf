var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'openFileRead',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.var] = fs.readFileSync(step.file);
		process.nextTick(checkNext);
	}
}
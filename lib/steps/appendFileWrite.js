var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'appendFileWrite',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.openFileWritesHandler[step.name] += step.content;
		process.nextTick(checkNext);
	}
}
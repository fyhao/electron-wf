var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'wsread',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var opts = ctx.opts;
		if(typeof opts.ws != 'undefined') {
			var val = util.fetchValue(opts.ws, step.col + opts.row);
			ctx.vars[step.var] = val;
		}
		process.nextTick(checkNext);
	}
}
var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'wsupdate',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var opts = ctx.opts;
		if(typeof opts.ws != 'undefined') {
			var toUpdate = true;
			if(typeof step.if != 'undefined') {
				var val = vars[step.ifvar];
				var validated = false;
				if(step.if == 'contains') {
					validated = val.indexOf(step.pattern) != -1;
				}
				else if(step.if == 'equal') {
					validated = val == step.pattern;
				}
				else if(step.if == 'eq') {
					validated = val == step.pattern;
				}
				else if(step.if == 'neq') {
					validated = val != step.pattern;
				}
				toUpdate = validated;
			}
			if(toUpdate) {
				opts.updateCellValue(step.col + opts.row, step.value);
			}
		}
		process.nextTick(checkNext);
	}
}
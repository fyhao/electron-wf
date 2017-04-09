var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'readExcelCell',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var wb = ctx.excelHandler[step.name];
		var ws = wb.getWorksheet(step.sheet);
		ctx.vars[step.var] = ws.getCell(step.cell).value;
		process.nextTick(checkNext);
	}
}
var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'writeExcelCell',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var wb = ctx.excelHandler[step.name];
		var ws = wb.getWorksheet(step.sheet);
		ws.getCell(step.cell).value = step.value;
		process.nextTick(checkNext);
	}
}
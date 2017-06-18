var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'writeExcelCell',
			desc : 'To write value into Excel cell',
			fields : [
			{type:'string',name:'name',description:'The name of Excel handler',required:true},
			
			{type:'string',name:'sheet',description:'The Excel sheet name',required:true},
			
			{type:'string',name:'cell',description:'The Excel cell to write to',required:true},
			
			{type:'string',name:'value',description:'The value to write into Excel cell',required:true},
			]
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
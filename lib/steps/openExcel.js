var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'openExcel',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			
			{type:'string',name:'name',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var workbook = new Excel.Workbook();
		workbook.xlsx.readFile(step.file)
			.then(function() {
				ctx.excelHandler[step.name] = workbook;
				process.nextTick(checkNext);
			});
	}
}
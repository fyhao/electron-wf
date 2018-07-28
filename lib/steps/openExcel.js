var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'openExcel',
			desc : 'To open excel file and load into a variable',
			fields : [
			{type:'string',name:'file',description:'The excel file to open',required:true},
			
			{type:'string',name:'name',description:'The variable name to hold excel file object',required:true}
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
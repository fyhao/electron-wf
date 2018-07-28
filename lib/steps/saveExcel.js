var fs = require('fs');
module.exports = {
	spec : function() {
		return {
			name : 'saveExcel',
			desc : 'To save excel file',
			fields : [
			{type:'string',name:'file',description:'The filename to save',required:true},
			
			{type:'string',name:'name',description:'The name of the Excel handler',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var wb = ctx.excelHandler[step.name];
		wb.xlsx.writeFile(step.file)
		.then(function() {
			process.nextTick(checkNext);
		});
	}
}
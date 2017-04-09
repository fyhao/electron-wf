var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'saveExcel',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			
			{type:'string',name:'name',description:'',required:true},
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
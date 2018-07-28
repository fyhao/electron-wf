module.exports = {
	spec : function() {
		return {
			name : 'readExcelCell',
			desc : 'To read excel cell value',
			fields : [
			{type:'string',name:'name',description:'The name of the excel handler',required:true},
			
			{type:'string',name:'sheet',description:'The Excel sheet of the target cell',required:true},
			
			{type:'string',name:'cell',description:'The Excel cell name, such as A3',required:true},
			
			{type:'string',name:'var',description:'The variable name to store the retrieved Excel cell value',required:true}
			]
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
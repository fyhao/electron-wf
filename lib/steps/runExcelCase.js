var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'runExcelCase',
			desc : 'To run Excel case row by row',
			fields : [
			
			{type:'string',name:'file',description:'The excel file to execute',required:true},
			
			{type:'string',name:'sheet',description:'The excel sheet',required:true},
			
			{type:'string',name:'startRow',description:'Starting row',required:true},
			
			{type:'string',name:'wf',description:'The workflow name to execute per row',required:true},
			
			
			{type:'string',name:'savefile',description:'The save resulted Excel file'},
			{type:'array',name:'outputVars',description:'The outputVars array pass to outside calling flow'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var workbook = new Excel.Workbook();
		workbook.xlsx.readFile(step.file)
			.then(function() {
				var ws = workbook.getWorksheet(step.sheet);
				var row = step.startRow;
				var val = null;
				var updateCellValue = function(cell, value) {
					ws.getCell(cell).value = value;
				}
				var checkExcelNext = function() {
					if((val = util.fetchValue(ws, 'A' + row)) !== null) {
						var inputstep = step;
						inputstep.row = row;
						for(var k in ctx.vars) {
							inputstep[k] = ctx.vars[k];
						}
						ctx.executeWorkFlow(ctx.config.workFlows[step.wf], {inputVars:inputstep,outputVars:step.outputVars,ws:ws,row:row,updateCellValue:updateCellValue,assert:ctx.opts.assert}, function(outputOpts) {
							if(outputOpts.outputVars) {
								for(var i in outputOpts.outputVars) {
									ctx.vars[i] = outputOpts.outputVars[i];
								}
							}
							row++;
							process.nextTick(checkExcelNext);
						});
					}
					else {
						// done
						if(typeof step.savefile !== 'undefined') {
							workbook.xlsx.writeFile(step.savefile)
							.then(function() {
								process.nextTick(checkNext);
							});
						}
						else {
							process.nextTick(checkNext);
						}
					}
				}
				process.nextTick(checkExcelNext);
			});
	}
}
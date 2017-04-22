var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
module.exports = {
	spec : function() {
		return {
			name : 'runExcelCase',
			desc : '',
			fields : [
			
			{type:'string',name:'file',description:'',required:true},
			
			{type:'string',name:'sheet',description:'',required:true},
			
			{type:'string',name:'startRow',description:'',required:true},
			
			{type:'string',name:'wf',description:'',required:true},
			
			
			{type:'string',name:'savefile',description:''},
			{type:'array',name:'outputVars',description:''}
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
						ctx.executeWorkFlow(ctx.config.workFlows[step.wf], {inputVars:inputstep,outputVars:step.outputVars,ws:ws,row:row,updateCellValue:updateCellValue}, function(outputOpts) {
							if(outputOpts.outputVars) {
								for(var i in outputOpts.outputVars) {
									if(!Object.prototype.hasOwnProperty.call(outputOpts.outputVars,i)) continue;
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
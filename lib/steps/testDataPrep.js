var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
var dbLib = ProjRequire('./lib/dbLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'testDataPrep',
			desc : 'To perform test data preparation',
			fields : [
			
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		initTestDataPrep(ctx,step.info, checkNext);
	}
}
var initTestDataPrep = function(ctx, cfg, donefn) {
	var config = ctx.config;
	var excelFile = cfg.testDataExcelFile;
	var workbook = new Excel.Workbook();
	workbook.xlsx.readFile(excelFile)
		.then(function() {
			var ws = workbook.getWorksheet(cfg.sheet);
			var startRow = cfg.startRow;
			var curRow = startRow;
			var firstCell = cfg.cells[0];
			var firstVal = null;
		
			var sql_list = [];
			
			// PRE PROCESS
			
			
			// PROCESS EACH ROW
			while((firstVal = util.fetchValue(ws, firstCell + curRow)) !== null) {
				var cellData = {};
				cfg.cells.forEach(function(c) {
					var val = util.fetchValue(ws, c + curRow);
					if(util.in_array(c, cfg.dateCells)) {
						var date = new Date(val);
						if(!isNaN(date.getTime())) {
							val = date.toISOString().substring(0, 10) + ' ' + date.toISOString().substring(11, 19);
						}
					}
					cellData[c] = val;
				});
				if(cfg.db !== null) {
					cfg.sql_templates.forEach(function(s) {
						for(var c in cellData) {
							var val = cellData[c];
							s = util.replaceAll(s, '##' + c + '##', val);
						}
						sql_list.push(s);
					});
				}
				curRow++;
			}
			
			// END PROCESS EACH ROW
			
			// POST PROCESS
			if(cfg.db !== null) {
				dbLib.query(null, config.db[cfg.db], sql_list, [], donefn);
			}
			
		});
	
}

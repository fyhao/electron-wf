var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
var sql = require('mssql');
module.exports = {
	spec : function() {
		return {
			name : 'testDataPrep',
			desc : '',
			fields : [
			
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		initTestDataPrep(ctx,step.info, checkNext);
	}
}
var replaceAll = function(s, n,v) {
	while(s.indexOf(n) != -1) {
		s = s.replace(n,v);
	}
	return s;
}
var fetchValue = function(ws,cell) {
	var val = ws.getCell(cell).value;
	if(val != null) {
		if(val.result != null) {
			val = val.result;
		}
		
		return val;
	}
	return null;
}
var in_array = function(item, arr) {
	var matched = false;
	arr.forEach(function(i) {
		if(item == i) matched = true;
	});
	return matched;
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
			var crm_template = null;
			var crm_issue_template = null;
			var crm_issue_entries = [];
			if(cfg.crm != null) {
				crm_template = fs.readFileSync(cfg.crm_input_template).toString();
				crm_issue_template = getStringBetween(crm_template, "##START##", "##END##");
			}
			
			// PROCESS EACH ROW
			while((firstVal = fetchValue(ws, firstCell + curRow)) != null) {
				var cellData = {};
				cfg.cells.forEach(function(c) {
					var val = fetchValue(ws, c + curRow);
					if(in_array(c, cfg.dateCells)) {
						var date = new Date(val);
						if(!isNaN(date.getTime())) {
							val = date.toISOString().substring(0, 10) + ' ' + date.toISOString().substring(11, 19);
						}
					}
					cellData[c] = val;
				});
				if(cfg.db != null) {
					cfg.sql_templates.forEach(function(s) {
						for(var c in cellData) {
							var val = cellData[c];
							s = replaceAll(s, '##' + c + '##', val);
						}
						sql_list.push(s);
					});
				}
				curRow++;
			}
			
			// END PROCESS EACH ROW
			
			// POST PROCESS
			if(cfg.db != null) {	
				var connection1 = new sql.Connection(config.db[cfg.db], function(err) {
					if(err) {
						console.log('error: ');
						console.err(err);
						process.nextTick(next);
						return;
					}
					var sql_list_i = 0;
					var next = function() {
						var i = sql_list[sql_list_i];
						var request = new sql.Request(connection1);
						console.log('SQL: ' + i);
						request.query(i, function(err, recordset) {
							if(err) {
								console.dir(err); return;
							}
							if(++sql_list_i < sql_list.length) {
								process.nextTick(next);
							}
							else {
								if(donefn) process.nextTick(donefn);
							}
						});
					}
					process.nextTick(next);
				});
			}
			
		});
	
}

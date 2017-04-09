var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var sql = require('mssql');
module.exports = {
	spec : function() {
		return {
			name : 'sql',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var connection1 = new sql.Connection(ctx.config.db[step.ds], function(err) {
			if(err) {
				console.log('Error');
				console.log(err);
				process.nextTick(checkNext)
				return
			}
			var request = new sql.Request(connection1);
			request.query(step.sql, function(err, recordset) {
				if(err) {
					console.dir(err);
					return;
				}
				//console.log(recordset);
				//console.log(step.recordsets);
				if(step.recordsets && step.recordsets.length) {
					recordset.forEach(function(i) {
						step.recordsets.forEach(function(j) {
							if(typeof i[j] != 'undefined') {
								ctx.vars[j] = i[j];
							}
						});
					});
				}
				process.nextTick(checkNext);
			});			
		});
	}
}
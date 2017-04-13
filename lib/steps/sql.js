var fs = require('fs');
var util = ProjRequire('./lib/util.js');

module.exports = {
	spec : function() {
		return {
			name : 'sql',
			desc : '',
			fields : [
			{type:'string',name:'ds',description:'',required:true},
			{type:'string',name:'sql',description:'',required:true},
			{type:'array',name:'recordsets',description:''},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var dbConfig = ctx.config.db[step.ds];
		var type = typeof(dbConfig.type) != 'undefined' ? dbConfig.type : 'mssql';
		if(type == 'mssql') {
			process_mssql(ctx, step, checkNext);
		}
		else if(type == 'mysql') {
			process_mysql(ctx, step, checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}

var process_mssql = function(ctx, step, checkNext) {
	var dbConfig = ctx.config.db[step.ds];
	var sql = require('mssql');
	var connection1 = new sql.Connection(dbConfig, function(err) {
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

var process_mysql = function(ctx, step, checkNext) {
	var dbConfig = ctx.config.db[step.ds];
	if(!dbConfig.host && dbConfig.server) dbConfig.host = dbConfig.server;
	var mysql      = require('mysql');
	var connection = mysql.createConnection(/*{
	  host     : 'localhost',
	  user     : 'me',
	  password : 'secret',
	  database : 'my_db'
	}*/dbConfig);

	connection.connect();

	connection.query(step.sql, function (error, results, fields) {
	  if (error) throw error;
	  if(step.recordsets && step.recordsets.length) {
			results.forEach(function(i) {
				step.recordsets.forEach(function(j) {
					if(typeof i[j] != 'undefined') {
						ctx.vars[j] = i[j];
					}
				});
			});
		}
		process.nextTick(checkNext);
	});

	connection.end();
}
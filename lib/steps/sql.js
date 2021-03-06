var dbLib = ProjRequire('./lib/dbLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'sql',
			desc : 'To run SQL over database, support MSSQL, MYSQL.',
			fields : [
			{type:'string',name:'ds',description:'The datasource',required:true},
			{type:'string',name:'sql',description:'The SQL to execute',required:true},
			{type:'array',name:'recordsets',description:'If it is SELECT query, here to access the recordsets data'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var dbConfig = ctx.config.db[step.ds];
		dbLib.query({
			ctx : ctx,
			cfg : dbConfig,
			sql : step.sql,
			recordsets : step.recordsets,
			checkNext : checkNext
		});
	}
}
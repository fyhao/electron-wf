var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var dbLib = ProjRequire('./lib/dbLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'sql',
			desc : '',
			fields : [
			{type:'string',name:'ds',description:'',required:true},
			{type:'string',name:'sql',description:'',required:true},
			{type:'array',name:'recordsets',description:''}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var dbConfig = ctx.config.db[step.ds];
		dbLib.query(ctx, dbConfig, step.sql, step.recordsets, checkNext);
	}
}
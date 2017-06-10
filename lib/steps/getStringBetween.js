var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'getStringBetween',
			desc : 'To search a string between two start and end key',
			fields : [
			{type:'string',name:'var',description:'The variable name of the original string to search',required:true},
			{type:'string',name:'result',description:'The variable name of the result',required:true},
			{type:'string',name:'start',description:'The start key',required:true},
			{type:'string',name:'end',description:'The end key',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.result] = util.getStringBetween(ctx.vars[step.var], step.start, step.end);
		process.nextTick(checkNext);
	}
}
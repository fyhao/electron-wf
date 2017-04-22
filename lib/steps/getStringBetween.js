var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'getStringBetween',
			desc : '',
			fields : [
			{type:'string',name:'var',description:'',required:true},
			{type:'string',name:'result',description:'',required:true},
			{type:'string',name:'start',description:'',required:true},
			{type:'string',name:'end',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.result] = util.getStringBetween(ctx.vars[step.var], step.start, step.end);
		process.nextTick(checkNext);
	}
}
var util = ProjRequire('lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'replaceAll',
			desc : '',
			fields : [
			{type:'string',name:'var',description:'',required:true},
			{type:'string',name:'source',description:'',required:true},
			{type:'string',name:'from',description:'',required:true},
			{type:'string',name:'to',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.var] = util.replaceAll(step.source, step.from, step.to);
		process.nextTick(checkNext);
	}
}
var util = ProjRequire('lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'replaceAll',
			desc : 'To replace all occurrences of certain keyword (from) into another string (to) with a source string, and store result into a variable',
			fields : [
			{type:'string',name:'var',description:'The variable name to store the result',required:true},
			{type:'string',name:'source',description:'The source string to replace',required:true},
			{type:'string',name:'from',description:'The from keyword to replace',required:true},
			{type:'string',name:'to',description:'The target keyword to replace to',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.var] = util.replaceAll(step.source, step.from, step.to);
		process.nextTick(checkNext);
	}
}
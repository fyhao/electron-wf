var util = ProjRequire('lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'replaceAll',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.var] = util.replaceAll(step.source, step.from, step.to);
		process.nextTick(checkNext);
	}
}
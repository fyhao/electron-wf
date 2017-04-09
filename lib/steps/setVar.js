module.exports = {
	spec : function() {
		return {
			name : 'setVar',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.name] = step.value;
		process.nextTick(checkNext);
	}
}
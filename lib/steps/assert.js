module.exports = {
	spec : function() {
		return {
			name : 'assert',
			desc : 'Use for unit testing assert in the runtime workflow',
			fields : [
			{type:'object',name:'expected',description:'The expected value for assert',required:true},
			{type:'object',name:'actual',description:'The actual value for assert',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var assert = ctx.opts.assert;
		if(typeof assert === 'undefined') {
			process.nextTick(checkNext);
			return;
		}
		assert.deepEqual(step.actual, step.expected);
		process.nextTick(checkNext);
	}
}
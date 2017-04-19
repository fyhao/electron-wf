module.exports = {
	spec : function() {
		return {
			name : 'assert',
			desc : '',
			fields : [
			{type:'object',name:'expected',description:'',required:true},
			{type:'object',name:'actual',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var assert = ctx.opts.assert;
		if(typeof assert == 'undefined') {
			process.nextTick(checkNext);
			return;
		}
		
		assert.equal(step.expected, step.actual);
		process.nextTick(checkNext);
	}
}
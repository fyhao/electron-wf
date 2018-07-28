module.exports = {
	spec : function() {
		return {
			name : 'evaljs',
			desc : 'To evaluate a JS code in workflow runtime',
			fields : [
			{type:'string',name:'var',description:'The variable name to store the JS code result',required:true},
			{type:'string',name:'code',description:'The JS code to be evaluated',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var val = eval('vars = ' + JSON.stringify(ctx.vars) + '; ' + step.code);
		ctx.vars[step.var] = val;
		process.nextTick(checkNext);
	}
}
module.exports = {
	spec : function() {
		return {
			name : 'incrementVar',
			desc : 'to increment an integer variable by 1',
			fields : [
			{type:'string',name:'name',description:'the name of variable to increment',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		
		ctx.vars[step.name] = parseInt(ctx.vars[step.name],10) + 1;
		
		process.nextTick(checkNext);
	}
}
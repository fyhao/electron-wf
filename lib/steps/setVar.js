module.exports = {
	spec : function() {
		return {
			name : 'setVar',
			desc : 'set variable',
			fields : [
			{type:'string',name:'name',description:'the name of the variable to set',required:true},
			{type:'string',name:'value',description:'the value of the variable to set to',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.name] = step.value;
		process.nextTick(checkNext);
	}
}
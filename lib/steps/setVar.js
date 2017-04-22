module.exports = {
	spec : function() {
		return {
			name : 'setVar',
			desc : '',
			fields : [
			{type:'string',name:'name',description:'',required:true},
			{type:'string',name:'value',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.name] = step.value;
		process.nextTick(checkNext);
	}
}
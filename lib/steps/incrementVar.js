module.exports = {
	spec : function() {
		return {
			name : 'incrementVar',
			desc : '',
			fields : [
			{type:'string',name:'name',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		try {
			ctx.vars[step.name] = parseInt(ctx.vars[step.name]) + 1;
		} catch (e) {
			console.log(e);
		}
		process.nextTick(checkNext);
	}
}
module.exports = {
	spec : function() {
		return {
			name : 'openFileWrite',
			desc : 'To open a file for writing into, store it as handler',
			fields : [
			{type:'string',name:'name',description:'the name of the file handler to write',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.openFileWritesHandler[step.name] = '';
		process.nextTick(checkNext);
	}
}
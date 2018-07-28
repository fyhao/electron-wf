module.exports = {
	spec : function() {
		return {
			name : 'appendFileWrite',
			desc : 'To append content into a file handler',
			fields : [
			{type:'string',name:'name',description:'the name of the file handler to write',required:true},
			{type:'string',name:'content',description:'the content message to append into file handler'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.openFileWritesHandler[step.name] += step.content;
		process.nextTick(checkNext);
	}
}
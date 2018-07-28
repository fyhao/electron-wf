var fs = require('fs');
module.exports = {
	spec : function() {
		return {
			name : 'closeFileWrite',
			desc : 'To close the file handler and save into output file',
			fields : [
			{type:'string',name:'file',description:'the file name for output file where the content will be saved',required:true},
			{type:'string',name:'name',description:'the name of the file handler to write',required:true},
			{type:'boolean',name:'append',description:'Is append the content at the behind of the file or override a new content'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(step.append) {
			fs.appendFileSync(step.file, ctx.openFileWritesHandler[step.name].toString());
		}
		else {
			fs.writeFileSync(step.file, ctx.openFileWritesHandler[step.name].toString());
		}
		ctx.openFileWritesHandler[step.name] = '';
		process.nextTick(checkNext);
	}
}
var fs = require('fs');
module.exports = {
	spec : function() {
		return {
			name : 'createFolder',
			desc : 'To create a new folder',
			fields : [
			{type:'string',name:'folder',description:'The folder location to create',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		fs.mkdirSync(step.folder);
		process.nextTick(checkNext);
	}
}
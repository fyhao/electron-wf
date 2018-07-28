var fs = require('fs');
module.exports = {
	spec : function() {
		return {
			name : 'deleteFile',
			desc : 'To delete file',
			fields : [
			{type:'string',name:'file',description:'The file to delete',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(fs.existsSync(step.file))
		fs.unlinkSync(step.file);
		process.nextTick(checkNext);
	}
}
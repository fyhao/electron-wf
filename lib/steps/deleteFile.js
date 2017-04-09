var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'deleteFile',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
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
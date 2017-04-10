var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'createFolder',
			desc : '',
			fields : [
			{type:'string',name:'folder',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		fs.mkdirSync(step.folder);
		process.nextTick(checkNext);
	}
}
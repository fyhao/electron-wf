var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'copyFolder',
			desc : 'To copy a folder from a source location to a target location',
			fields : [
			{type:'string',name:'source',description:'The original location of the folder to copy',required:true},
			{type:'string',name:'target',description:'The destination location of the folder to copy to',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(fs.existsSync(step.source)) {
			util.copyFolderRecursiveSync(step.source, step.target);
			process.nextTick(checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}
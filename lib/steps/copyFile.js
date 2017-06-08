var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'copyFile',
			desc : 'To copy a file from a source location to a target location',
			fields : [
			{type:'string',name:'source',description:'The original location of the file to copy',required:true},
			{type:'string',name:'target',description:'The destination location of the file to copy to',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(fs.existsSync(step.source)) {
			util.copyFileSync(step.source, step.target);
			process.nextTick(checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}
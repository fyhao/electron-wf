var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'copyFile',
			desc : '',
			fields : [
			{type:'string',name:'source',description:'',required:true},
			{type:'string',name:'target',description:'',required:true}
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
var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'openFileRead',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.var] = fs.readFileSync(step.file);
		process.nextTick(checkNext);
	}
}
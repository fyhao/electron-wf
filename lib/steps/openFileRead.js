var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'openFileRead',
			desc : 'To open file and store content into a variable',
			fields : [
			{type:'string',name:'file',description:'The file to open',required:true},
			{type:'string',name:'var',description:'The variable name to store the file content',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.vars[step.var] = fs.readFileSync(step.file, 'utf8');
		process.nextTick(checkNext);
	}
}
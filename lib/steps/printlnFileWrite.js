var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'printlnFileWrite',
			desc : '',
			fields : [
				{type:'string',name:'name',description:'the name of the file handler to write',required:true},
				{type:'string',name:'content',description:'the content message to print line to'},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.openFileWritesHandler[step.name] += step.content + "\r\n";
		process.nextTick(checkNext);
	}
}
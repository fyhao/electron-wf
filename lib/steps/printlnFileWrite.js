var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'printlnFileWrite',
			desc : '',
			fields : [
				{type:'string',name:'name',description:'',required:true},
				{type:'string',name:'content',description:''},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		ctx.openFileWritesHandler[step.name] += step.content + "\r\n";
		process.nextTick(checkNext);
	}
}
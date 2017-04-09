var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'closeFileWrite',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			{type:'string',name:'name',description:'',required:true},
			{type:'boolean',name:'append',description:'',},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(step.append) {
			fs.appendFileSync(step.file, ctx.openFileWritesHandler[step.name].toString());
		}
		else {
			fs.writeFileSync(step.file, ctx.openFileWritesHandler[step.name].toString());
		}
		ctx.openFileWritesHandler[step.name] = '';
		process.nextTick(checkNext);
	}
}
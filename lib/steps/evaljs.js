var fs = require('fs');
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'evaljs',
			desc : '',
			fields : [
			{type:'string',name:'var',description:'',required:true},
			{type:'string',name:'code',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var val = eval('vars = ' + JSON.stringify(ctx.vars) + '; ' + step.code);
		ctx.vars[step.var] = val;
		process.nextTick(checkNext);
	}
}
var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'wsread',
			desc : 'To read Excel cell and store it into a variable',
			fields : [
			{type:'string',name:'col',description:'The excel column to read',required:true},
			
			{type:'string',name:'var',description:'The variable name to store the value read from Excel cell',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var opts = ctx.opts;
		if(typeof opts.ws !== 'undefined') {
			var val = util.fetchValue(opts.ws, step.col + opts.row);
			ctx.vars[step.var] = val;
		}
		process.nextTick(checkNext);
	}
}
module.exports = {
	spec : function() {
		return {
			name : 'diff',
			desc : 'To diff array',
			fields : [
			{type:'string',name:'arrayA',description:'The variable name of array A',required:true},
			{type:'string',name:'arrayB',description:'The variable name of array B',required:true},
			{type:'string',name:'result',description:'The variable name of result',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var arrayA = ctx.vars[step.arrayA];
		var arrayB = ctx.vars[step.arrayB];
		var arrayC = arrayA.filter(function(i) { return arrayB.indexOf(i) == -1});
		ctx.vars[step.result] = arrayC;
		process.nextTick(checkNext);
	}
}
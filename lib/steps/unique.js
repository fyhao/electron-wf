
module.exports = {
	spec : function() {
		return {
			name : 'unique',
			desc : 'To perform set operation over an array to return unique items result',
			fields : [
			{type:'string',name:'array',description:'The variable name of an array',required:true},
			{type:'string',name:'result',description:'The variable name of result',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var array = ctx.vars[step.array];
		array = unique(array);
		ctx.vars[step.result] = array;
		process.nextTick(checkNext);
	}
}

var unique = function(array) {
	return array.filter( onlyUnique );
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
module.exports = {
	spec : function() {
		return {
			name : "setVar",
			description : "setVar desc",
			fields : [
				{type: 'string', name:'name', description: 'the name of the variable', required:true}, 
				{type: 'string', name:'value', description: 'the value of the variable', required:true} 
			]
		}
	}
	,
	process : function(ctx, step, next) {
		process.nextTick(next);
	}
}
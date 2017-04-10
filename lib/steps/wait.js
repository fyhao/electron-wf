
module.exports = {
	spec : function() {
		return {
			name : 'wait',
			desc : '',
			fields : [
			{type:'integer',name:'time',description:'in millisecond',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(checkNext, step.time);
	}
}

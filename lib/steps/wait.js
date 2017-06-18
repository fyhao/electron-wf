
module.exports = {
	spec : function() {
		return {
			name : 'wait',
			desc : 'To wait a timeout before continue',
			fields : [
			{type:'integer',name:'time',description:'time to wait, in millisecond',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(checkNext, step.time);
	}
}

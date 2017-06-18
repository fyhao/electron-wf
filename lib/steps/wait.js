
module.exports = {
	spec : function() {
		return {
			name : 'wait',
			desc : 'To wait a timeout before continue',
			fields : [
			{type:'integer',name:'timeout',description:'time to wait, in millisecond',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var timeout = 0;
		if(timeout == 0 && typeof step.timeout !== 'undefined') timeout = step.timeout;
		if(timeout == 0 && typeof step.time !== 'undefined') timeout = step.time;
		setTimeout(checkNext, timeout);
	}
}

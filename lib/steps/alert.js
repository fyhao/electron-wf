var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'alert',
			desc : 'An alert prompt to show info or error message to user',
			fields : [
			{type:'string',name:'message',description:'The info or error message to shown in alert prompt',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(function() {
			util.alert({message:step.message,buttons:['OK']});
			process.nextTick(checkNext);
		}, 100);
	}
}

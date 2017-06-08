var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'confirm',
			desc : 'To provide confirmation prompt for user to answer',
			fields : [
			{type:'string',name:'message',description:'The information to be displayed in confirmation prompt',required:true},
			{type:'array',name:'buttons',description:'List of buttons shown to user', required:true},
			{type:'string',name:'answer',description:'The answer string after a button pressed'},
			{type:'integer',name:'answerIndex',description:'The answer index after a button pressed'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(function() {
			var answerIndex = util.alert({message:step.message,buttons:step.buttons});
			if(typeof step.answerIndex !== 'undefined') {
				ctx.vars[step.answerIndex] = answerIndex;
			}
			if(typeof step.answer !== 'undefined') {
				ctx.vars[step.answer] = step.buttons[answerIndex];
			}
			process.nextTick(checkNext);
		}, 100);
	}
}

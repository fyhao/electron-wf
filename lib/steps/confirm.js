const {app, BrowserWindow, Menu, dialog} = require('electron')
module.exports = {
	spec : function() {
		return {
			name : 'confirm',
			desc : '',
			fields : [
			{type:'string',name:'message',description:'',required:true},
			{type:'array',name:'buttons',description:'', required:true},
			{type:'string',name:'answer',description:''},
			{type:'integer',name:'answerIndex',description:''},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(function() {
			var answerIndex = dialog.showMessageBox({message:step.message,buttons:step.buttons});
			if(typeof step.answerIndex != 'undefined') {
				ctx.vars[step.answerIndex] = answerIndex;
			}
			if(typeof step.answer != 'undefined') {
				ctx.vars[step.answer] = step.buttons[answerIndex];
			}
			process.nextTick(checkNext);
		}, 100);
	}
}

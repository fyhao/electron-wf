const {app, BrowserWindow, Menu, dialog} = require('electron')
module.exports = {
	spec : function() {
		return {
			name : 'alert',
			desc : '',
			fields : [
			{type:'string',name:'message',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(function() {
			dialog.showMessageBox({message:step.message,buttons:['OK']});
			process.nextTick(checkNext);
		}, 100);
	}
}

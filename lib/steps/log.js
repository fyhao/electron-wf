module.exports = {
	spec : function() {
		return {
			name : 'log',
			desc : '',
			fields : [
				{type:'string',name:'log',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		console.log(step.log);
		ctx.mainWin.webContents.send('wfevt', {action:'log',item:{log:step.log}});
		process.nextTick(checkNext);
	}
}
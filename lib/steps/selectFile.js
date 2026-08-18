var getDialog = function(ctx) {
	if(ctx.dialog) {
		return ctx.dialog;
	}
	return require('electron').dialog;
}

module.exports = {
	spec : function() {
		return {
			name : 'selectFile',
			desc : 'Prompt the user to select one or more files and store the selected paths',
			fields : [
			{type:'string',name:'var',description:'The variable name to store selected file paths',required:true},
			{type:'boolean',name:'multiple',description:'Allow selecting more than one file (default: false)'},
			{type:'string',name:'folder',description:'Initial folder shown in the selection dialog'},
			{type:'array',name:'filters',description:'Electron file filters, for example [{name:"Text",extensions:["txt"]}]'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var properties = ['openFile'];
		if(step.multiple) {
			properties.push('multiSelections');
		}
		var options = {properties:properties};
		if(typeof step.folder !== 'undefined') {
			options.defaultPath = step.folder;
		}
		if(typeof step.filters !== 'undefined') {
			options.filters = step.filters;
		}
		getDialog(ctx).showOpenDialog(ctx.mainWin, options).then(function(result) {
			ctx.vars[step.var] = result.canceled ? [] : result.filePaths;
			process.nextTick(checkNext);
		}).catch(function(error) {
			process.nextTick(function() {
				checkNext(error);
			});
		});
	}
}

var ifLib = ProjRequire('./lib/ifLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'wsupdate',
			desc : 'To perform Excel cell update',
			fields : [
			
			{type:'string',name:'col',description:'The Excel column to update',required:true},
			
			
			{type:'string',name:'value',description:'The value to update',required:true},
			
			{type:'string',name:'if',description:'Optional, if condition to whether to update the cell value, used with ifvar, pattern'},
			{type:'string',name:'ifvar',description:'Optional, used with if'},
			{type:'string',name:'pattern',description:'Optional, used with if'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var opts = ctx.opts;
		if(typeof opts.ws !== 'undefined') {
			var toUpdate = true;
			if(typeof step.if !== 'undefined') {
				var val = vars[step.ifvar];
				var validated = ifLib.validateIf(step.if, val, step.pattern);
				toUpdate = validated;
			}
			if(toUpdate) {
				opts.updateCellValue(step.col + opts.row, step.value);
			}
		}
		process.nextTick(checkNext);
	}
}
var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var Excel = require('exceljs');
var ifLib = ProjRequire('./lib/ifLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'wsupdate',
			desc : '',
			fields : [
			
			{type:'string',name:'col',description:'',required:true},
			
			
			{type:'string',name:'value',description:'',required:true},
			
			{type:'string',name:'if',description:''},
			{type:'string',name:'ifvar',description:''},
			{type:'string',name:'pattern',description:''}
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
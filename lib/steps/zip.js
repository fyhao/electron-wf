var nodeJsZip = require("nodeJs-zip");
var path = require('path');
module.exports = {
	spec : function() {
		return {
			name : 'zip',
			desc : 'To perform zip operation',
			fields : [
			{type:'string',name:'file',description:'The zipped file name',required:true},
			{type:'string',name:'include',description:'The files that need to include in a zip',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		step.file = step.file.replace('.zip', '');
		nodeJsZip.zip(path.resolve(step.include), {name:step.file});
		process.nextTick(checkNext);
	}
}
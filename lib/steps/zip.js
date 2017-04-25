var nodeJsZip = require("nodeJs-zip");
var path = require('path');
module.exports = {
	spec : function() {
		return {
			name : 'zip',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			{type:'string',name:'include',description:'',required:true}
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
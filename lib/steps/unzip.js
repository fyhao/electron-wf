var nodeJsZip = require("nodeJs-zip");
var fs = require('fs');
var path = require('path');
module.exports = {
	spec : function() {
		return {
			name : 'unzip',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			{type:'string',name:'location',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var callback = function(isDir,name,data){
			var root = step.location;
			if(isDir){
			
				// you can filter some directory here 
				
				fs.mkdirSync(path.join(root,name));
			}else{
			
				// you can filter some file here 
				
				fs.writeFileSync(path.join(root,name),data);
			}
		}
		nodeJsZip.unzip(step.file,callback);
		process.nextTick(checkNext);
	}
}
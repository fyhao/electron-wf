var fs = require('fs');
module.exports = {
	spec : function() {
		return {
			name : 'copyFile',
			desc : '',
			fields : [
			{type:'string',name:'source',description:'',required:true},
			{type:'string',name:'target',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(fs.existsSync(step.source)) {
			var stream = fs.createReadStream(step.source).pipe(fs.createWriteStream(step.target));
			stream.on('finish', function () { process.nextTick(checkNext); });
		}
		else {
			process.nextTick(checkNext);
		}
	}
}
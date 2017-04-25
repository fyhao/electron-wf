var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var path = require('path');
var ifLib = ProjRequire('./lib/ifLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'listFiles',
			desc : '',
			fields : [
			{type:'string',name:'folder',description:'',required:true},
			{type:'array',name:'var',description:'',required:true},
			{type:'string',name:'filter',description:''},
			{type:'string',name:'if',description:''}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var result = [];
		result = readdir(step.folder);
		if(typeof step.filter !== 'undefined') {
			step.if = typeof step.if !== 'undefined' ? step.if : ifLib.defaults();
			result = filter(result, step.filter, step.if);
		}
		ctx.vars[step.var] = result;
		process.nextTick(checkNext);
	}
}

var readdir = function(folder) {
	var result = [];
	var list = fs.readdirSync(folder); 
	if(list && list.length) {
		list.forEach(function(filepath) {
			filepath = path.join(folder, filepath);
			if(fs.lstatSync(filepath).isDirectory()) {
				var subResult = readdir(filepath);
				if(subResult && subResult.length) {
					subResult.forEach(function(subRes) {
						result.push(subRes);
					});
				}
			}
			else {
				result.push(filepath);
			}
		});
	}
	return result;
}

var filter = function(list, _filter, _if) {
	return list.filter(function(item) {
		return ifLib.validateIf(_if, item, _filter);
	});
}
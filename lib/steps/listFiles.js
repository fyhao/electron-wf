var fs = require('fs');
var path = require('path');
var ifLib = ProjRequire('./lib/ifLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'listFiles',
			desc : 'To list the files on specified folder and store the result in array, support filter operation',
			fields : [
			{type:'string',name:'folder',description:'The target folder path to list the files',required:true},
			{type:'array',name:'var',description:'The variable name to store the result of file list',required:true},
			{type:'string',name:'filter',description:'The filter operation to apply if any, used with if'},
			{type:'string',name:'if',description:'The if operation to apply if any'}
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
		else if(typeof step.expr !== 'undefined') {
			result = filterExpr(result, step.expr);
		}
		if(typeof step.sortByDateTime != 'undefined') {
			sortByDateTime(result, step.sortByDateTime);
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
var filterExpr = function(list, _expr) {
	return list.filter(function(item) {
		var expr = _expr;
		if(expr.indexOf('return') == -1) {
			expr = 'return ' + expr;
		}
		var fn = new Function('item', expr);
		var ret = fn(item);
		return ret;
	});
}
//sortByDateTime(result, step.sortByDateTime);
var sortByDateTime = function(result, sortBy) {
	result.sort(function(a,b) {
		var stat_a = fs.statSync(a);
		var stat_b = fs.statSync(b);
		if(stat_a.mtime == stat_b.mtime) return 0;
		if(sortBy == 'desc') return stat_b.mtime > stat_a.mtime ? 1 : -1;
		if(sortBy == 'asc') return stat_a.mtime > stat_b.mtime ? 1 : -1;
	});
}
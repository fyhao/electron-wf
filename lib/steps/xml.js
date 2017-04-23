var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var xml2js = require('xml2js')
module.exports = {
	spec : function() {
		return {
			name : 'xml',
			desc : '',
			fields : [
			{type:'string',name:'file',description:'',required:true},
			{type:'string',name:'var',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var parser = new xml2js.Parser();
		fs.readFile(step.file, function(err, data) {
			if(err) {
				throw new Error("Error reading file " + step.file);
			}
			parser.parseString(data, function(err1, result) {
				if(err1) {
					throw new Error("Error parsing data " + step.file);
				}
				ctx.vars[step.var] = result;
				process.nextTick(checkNext);
			});
		});
	}
}
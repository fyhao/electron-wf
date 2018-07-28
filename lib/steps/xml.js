var fs = require('fs');
var xml2js = require('xml2js')
module.exports = {
	spec : function() {
		return {
			name : 'xml',
			desc : 'Parse XML file',
			fields : [
			{type:'string',name:'file',description:'XML file to parse',required:true},
			{type:'string',name:'var',description:'The variable name to store result',required:true}
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
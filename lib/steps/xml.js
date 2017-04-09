var fs = require('fs');
var util = ProjRequire('./lib/util.js');
var xml2js = require('xml2js')
module.exports = {
	spec : function() {
		return {
			name : 'xml',
			desc : '',
			fields : []
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var parser = new xml2js.Parser();
		fs.readFile(step.file, function(err, data) {
			parser.parseString(data, function(err1, result) {
				ctx.vars[step.var] = result;
				console.log(result);
				process.nextTick(checkNext);
			});
		});
	}
}
var fs = require('fs');
var readline = require('readline');

module.exports = {
	spec : function() {
		return {
			name : 'bufferedReader',
			desc : 'Stream a text file line by line and run a workflow for every line.',
			fields : [
				{type:'string',name:'file',description:'The text file to stream',required:true},
				{type:'string',name:'wf',description:'The workflow to run for every line',required:true},
				{type:'string',name:'lineVar',description:'Variable name for the current line; defaults to line'},
				{type:'string',name:'lineNumberVar',description:'Variable name for the one-based line number; defaults to lineNumber'},
				{type:'array',name:'outputVars',description:'Variables to retain from each child workflow'},
				{type:'string',name:'outputVar',description:'Child output variable to append to outputFile'},
				{type:'string',name:'outputFile',description:'Optional file receiving one outputVar value per line'}
			]
		};
	},
	process : function(ctx, step, next) {
		var workflow = ctx.config.workFlows[step.wf];
		if(!workflow) {
			process.nextTick(function() { next(new Error('Workflow not found: ' + step.wf)); });
			return;
		}

		var lineVar = step.lineVar || 'line';
		var lineNumberVar = step.lineNumberVar || 'lineNumber';
		var lineNumber = 0;
		var finished = false;
		var output = [];
		var stream = fs.createReadStream(step.file, {encoding:'utf8'});
		var reader = readline.createInterface({input:stream, crlfDelay:Infinity});

		function finish(error) {
			if(finished) return;
			finished = true;
			reader.close();
			if(error) {
				process.nextTick(function() { next(error); });
				return;
			}
			try {
				if(step.outputFile) fs.writeFileSync(step.outputFile, output.join('\n') + (output.length ? '\n' : ''));
				process.nextTick(next);
			} catch (writeError) {
				process.nextTick(function() { next(writeError); });
			}
		}

		reader.on('error', finish);
		stream.on('error', finish);
		reader.on('line', function(line) {
			reader.pause();
			lineNumber++;
			var inputVars = {};
			Object.keys(ctx.vars).forEach(function(key) { inputVars[key] = ctx.vars[key]; });
			inputVars[lineVar] = line;
			inputVars[lineNumberVar] = lineNumber;
			inputVars.outputall = true;
			ctx.executeWorkFlow(workflow, {inputVars:inputVars, outputVars:step.outputVars, assert:ctx.opts.assert}, function(result) {
				if(result && result.error) return finish(result.error);
				if(result && result.outputVars) {
					Object.keys(result.outputVars).forEach(function(key) { ctx.vars[key] = result.outputVars[key]; });
					if(step.outputFile && step.outputVar && typeof result.outputVars[step.outputVar] !== 'undefined') output.push(result.outputVars[step.outputVar]);
				}
				reader.resume();
			});
		});
		reader.on('close', function() { finish(); });
	}
};

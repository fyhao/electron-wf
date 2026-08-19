var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var bufferedReader = ProjRequire('./lib/steps/bufferedReader.js');

describe('bufferedReader step', function() {
	it('streams lines sequentially, preserves child output, and writes selected output', function(done) {
		var directory = fs.mkdtempSync(path.join(os.tmpdir(), 'electron-wf-buffered-reader-'));
		var input = path.join(directory, 'access.log');
		var output = path.join(directory, 'matches.log');
		fs.writeFileSync(input, 'first\nsecond\nthird\n');
		var received = [];
		var ctx = {
			vars:{}, opts:{}, config:{workFlows:{processLine:{}}},
			executeWorkFlow:function(workflow, opts, callback) {
				received.push(opts.inputVars.line + ':' + opts.inputVars.lineNumber);
				callback({outputVars:{lastLine:opts.inputVars.line, match:opts.inputVars.line.toUpperCase()}});
			}
		};
		bufferedReader.process(ctx, {file:input, wf:'processLine', outputFile:output, outputVar:'match'}, function(error) {
			assert.ifError(error);
			assert.deepEqual(received, ['first:1','second:2','third:3']);
			assert.equal(ctx.vars.lastLine, 'third');
			assert.equal(fs.readFileSync(output, 'utf8'), 'FIRST\nSECOND\nTHIRD\n');
			done();
		});
	});

	it('returns an error for an unknown child workflow', function(done) {
		bufferedReader.process({vars:{}, opts:{}, config:{workFlows:{}}, executeWorkFlow:function() {}}, {file:'unused.log', wf:'missing'}, function(error) {
			assert.equal(error.message, 'Workflow not found: missing');
			done();
		});
	});
});

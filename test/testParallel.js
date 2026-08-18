var assert = require('assert');
var parallel = ProjRequire('./lib/steps/parallel.js');
describe('parallel step', function() {
	it('waits for every workflow and merges outputs', function(done) {
		var ctx={vars:{source:1},opts:{},config:{workFlows:{one:{},two:{}}},executeWorkFlow:function(wf, opts, cb) {
			setTimeout(function() { cb({outputVars:wf===ctx.config.workFlows.one?{one:true}:{two:true}}); }, 5);
		}};
		parallel.process(ctx,{workflows:['one','two']},function(error) {
			assert.ifError(error); assert.deepEqual(ctx.vars,{source:1,one:true,two:true}); done();
		});
	});
});

var assert = require('assert');
var selectFile = ProjRequire('./lib/steps/selectFile.js');

describe('selectFile step', function() {
	it('stores one selected path and passes dialog options', function(done) {
		var capturedOptions;
		var ctx = {
			vars:{},
			mainWin:{},
			dialog:{showOpenDialog:function(win, options) {
				capturedOptions = options;
				return Promise.resolve({canceled:false,filePaths:['/tmp/a.txt']});
			}}
		};
		selectFile.process(ctx, {var:'selected',folder:'/tmp',filters:[{name:'Text',extensions:['txt']}]}, function(error) {
			assert.ifError(error);
			assert.deepEqual(ctx.vars.selected, ['/tmp/a.txt']);
			assert.deepEqual(capturedOptions.properties, ['openFile']);
			assert.equal(capturedOptions.defaultPath, '/tmp');
			done();
		});
	});

	it('stores an empty array when selection is cancelled', function(done) {
		var ctx = {vars:{},mainWin:{},dialog:{showOpenDialog:function() {
			return Promise.resolve({canceled:true,filePaths:['/tmp/ignored.txt']});
		}}};
		selectFile.process(ctx, {var:'selected',multiple:true}, function(error) {
			assert.ifError(error);
			assert.deepEqual(ctx.vars.selected, []);
			done();
		});
	});
});

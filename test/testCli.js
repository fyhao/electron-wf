var assert = require('assert');
var cli = ProjRequire('./cli.js');

describe('cli', function() {
	it('parses headless mode, workflow and file options', function() {
		assert.deepEqual(cli.parseArgs(['--headless','--file=demo.wf','--workflow','Demo']), {
			headless:true,
			file:'demo.wf',
			workflow:'Demo'
		});
	});

	it('accepts the separate file argument form', function() {
		assert.deepEqual(cli.parseArgs(['--file','demo.wf']), {headless:false,file:'demo.wf'});
	});
});

var assert = require('assert');
var dbLib = ProjRequire('./lib/dbLib.js');

describe('Oracle database support', function() {
	afterEach(function() { dbLib.setOracleDriver(null); });

	it('maps selected Oracle columns into workflow variables and closes the connection', function(done) {
		var closed = false;
		dbLib.setOracleDriver({
			OUT_FORMAT_OBJECT:1,
			getConnection:function(config, callback) {
				assert.equal(config.user, 'scott');
				callback(null, {
					execute:function(sql, binds, options, result) { result(null, {rows:[{NAME:'SCOTT', ID:7}]}); },
					close:function(callback) { closed = true; callback(); }
				});
			}
		});
		var ctx = {vars:{}};
		dbLib.query({ctx:ctx, cfg:{type:'oracle', user:'scott'}, sql:'select * from users', recordsets:['NAME','ID'], checkNext:function(error) {
			assert.ifError(error);
			assert.deepEqual(ctx.vars, {NAME:'SCOTT', ID:7});
			assert.equal(closed, true);
			done();
		}});
	});
});

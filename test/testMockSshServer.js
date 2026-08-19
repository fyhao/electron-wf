var assert = require('assert');
var Client = require('ssh2').Client;
var mockSshServer = require('./helpers/mockSshServer.js');

describe('mock SSH server', function() {
	it('accepts an SSH client command and returns deterministic output', function(done) {
		mockSshServer.start(function(command) { return 'mock:' + command + '\n'; }, function(server, port) {
			var client = new Client();
			client.on('ready', function() {
				client.exec('whoami', function(error, stream) {
					assert.ifError(error);
					var output = '';
					stream.on('data', function(chunk) { output += chunk.toString(); });
					stream.on('close', function() { assert.equal(output, 'mock:whoami\n'); client.end(); });
				});
			});
			client.on('close', function() { server.close(done); });
			client.connect({host:'127.0.0.1', port:port, username:'test', password:'test', readyTimeout:5000});
		});
	});
});

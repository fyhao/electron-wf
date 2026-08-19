var crypto = require('crypto');
var Server = require('ssh2').Server;

module.exports.start = function(handler, callback) {
	var keys = crypto.generateKeyPairSync('rsa', {modulusLength:2048});
	var server = new Server({hostKeys:[keys.privateKey.export({type:'pkcs1', format:'pem'})]}, function(client) {
		client.on('authentication', function(context) { context.accept(); });
		client.on('ready', function() {
			client.on('session', function(accept) {
				var session = accept();
				session.on('exec', function(acceptExec, reject, info) {
					var stream = acceptExec();
					stream.write(handler(info.command));
					stream.exit(0);
					stream.end();
				});
			});
		});
	});
	server.listen(0, '127.0.0.1', function() { callback(server, server.address().port); });
};

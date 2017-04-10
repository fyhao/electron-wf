var SSH = require('simple-ssh');
module.exports = {
	spec : function() {
		return {
			name : 'ssh',
			desc : '',
			fields : [
			{type:'string',name:'host',description:'',required:true},
			{type:'integer',name:'port',description:'default 22'},
			{type:'string',name:'user',description:'',required:true},
			{type:'string',name:'pass',description:'',required:true},
			{type:'array',name:'cmds',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var port = 22;
		if(typeof step.port != 'undefined') {
			port = step.port;
		}
		var cmds = step.cmds;
		var cfg = {
			"host": step.host,
			"user": step.user,
			"pass": step.pass,
			"port": port
		};
		var ssh = new SSH(cfg)
		var ran_cmd = 0;
		cmds.forEach(function(cmd) {
			ssh.exec(cmd, {exit:function(stdout) {
				console.log(stdout)
				ran_cmd++;
				if(ran_cmd >= cmds.length) {
					process.nextTick(checkNext);
				}
			}, out : function(stdout) {
				console.log("[" + stdout + "]");
			}});
		});
		ssh.start({success: function() {
			console.log('success');
		}});
		ssh.on('error', function(err) {
			console.log('Oops, something went wrong.');
			console.log(err);
			ssh.end();
		});
	}
}

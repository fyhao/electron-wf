var Client = require('scp2').Client;
module.exports = {
	spec : function() {
		return {
			name : 'scp',
			desc : 'To SCP file over SSH',
			fields : [
			{type:'string',name:'host',description:'The SSH Host',required:true},
			{type:'integer',name:'port',description:'The SSH port, default 22'},
			{type:'string',name:'user',description:'The SSH username',required:true},
			{type:'string',name:'pass',description:'The SSH password',required:true},
			{type:'string',name:'src',description:'The source file, it is local when upload, remote when download',required:true},
			{type:'string',name:'dest',description:'The destination file, it is remote when upload, local when download',required:true},
			{type:'string',name:'action',description:'upload/download',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var port = 22;
		if(typeof step.port !== 'undefined') {
			port = step.port;
		}
		var cfg = {
			"host": step.host,
			"username": step.user,
			"password": step.pass,
			"port": port
		};
		var src = step.src;
		var dest = step.dest;
		var client = new Client(cfg);
		if(step.action === 'download') {
			client.download(src,dest,checkNext);
		}
		else if(step.action === 'upload') {
			client.upload(src,dest,checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}

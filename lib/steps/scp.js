var Client = require('scp2').Client;
module.exports = {
	spec : function() {
		return {
			name : 'scp',
			desc : '',
			fields : [
			{type:'string',name:'host',description:'',required:true},
			{type:'integer',name:'port',description:'default 22'},
			{type:'string',name:'user',description:'',required:true},
			{type:'string',name:'pass',description:'',required:true},
			{type:'string',name:'src',description:'',required:true},
			{type:'string',name:'dest',description:'',required:true},
			{type:'string',name:'action',description:'upload/download',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var port = 22;
		if(typeof step.port != 'undefined') {
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
		if(step.action == 'download') {
			client.download(src,dest,checkNext);
		}
		else if(step.action == 'upload') {
			client.upload(src,dest,checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}

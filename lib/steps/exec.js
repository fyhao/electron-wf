var cp = require('child_process');
module.exports = {
	spec : function() {
		return {
			name : 'exec',
			desc : '',
			fields : [
			{type:'string',name:'cmd',description:'',required:true},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		console.log('Exec ' + step.cmd);
		cp.exec(step.cmd, function(err, stdout, stderr) {
			console.log('err ' + err);
			console.log('stdout ' + stdout);
			console.log('stderr ' + stderr);
			ctx.vars['execStdout'] = stdout;
			ctx.vars['execStderr'] = stderr;
			process.nextTick(checkNext);
		});
	}
}
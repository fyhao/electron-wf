module.exports = {
	spec:function() { return {name:'parallel',desc:'Run named workflows concurrently and merge their output variables',fields:[
		{type:'array',name:'workflows',description:'Workflow names to run concurrently',required:true}
	]}; },
	process:function(ctx, step, next) {
		var names = step.workflows || [];
		if(!names.length) return process.nextTick(next);
		var pending = names.length;
		var finished = false;
		function complete(error, output) {
			if(finished) return;
			if(error) { finished = true; return process.nextTick(function() { next(error); }); }
			if(output && output.outputVars) {
				Object.keys(output.outputVars).forEach(function(key) { ctx.vars[key] = output.outputVars[key]; });
			}
			pending--;
			if(!pending) { finished = true; process.nextTick(next); }
		}
		names.forEach(function(name) {
			var workflow = ctx.config.workFlows[name];
			if(!workflow) return complete(new Error('Workflow not found: ' + name));
			var inputVars = {};
			Object.keys(ctx.vars).forEach(function(key) { inputVars[key] = ctx.vars[key]; });
			ctx.executeWorkFlow(workflow, {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(output) {
				complete(output && output.error, output);
			});
		});
	}
};

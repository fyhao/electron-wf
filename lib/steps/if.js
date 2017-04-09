module.exports = {
	spec : function() {
		return {
			name : 'if',
			desc : '',
			fields : [
			{type:'string',name:'var',description:'',required:true},
			{type:'string',name:'if',description:'',required:true},
			{type:'string',name:'pattern',description:'',required:true},
			{type:'string',name:'yes_subflow',description:'',},
			{type:'string',name:'no_subflow',description:'',},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var val = ctx.vars[step.var];
		var validated = false;
		if(step.if == 'contains') {
			validated = val.indexOf(step.pattern) != -1;
		}
		else if(step.if == 'equal') {
			//console.log('execute if [' + val + '] = [' + step.pattern + ']');
			validated = val == step.pattern;
		}
		else if(step.if == 'eq') {
			//console.log('execute if [' + val + '] = [' + step.pattern + ']');
			validated = val == step.pattern;
		}
		else if(step.if == 'neq') {
			//console.log('execute if [' + val + '] = [' + step.pattern + ']');
			validated = val != step.pattern;
		}
		if(validated) {
			if(step.yes_subflow != null) {
				var inputVars = step;
				for(var i in ctx.vars) {
					inputVars[i] = ctx.vars[i];
				}
				inputVars['inputall'] = true;
				inputVars['outputall'] = true;
				ctx.executeWorkFlow(ctx.config.workFlows[step.yes_subflow], {inputVars:inputVars,outputVars:step.yes_outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var i in outputOpts.outputVars) {
							ctx.vars[i] = outputOpts.outputVars[i];
						}
					}
					process.nextTick(checkNext);
				});
			}
			else {
				process.nextTick(checkNext);
			}
		}
		else {
			if(step.no_subflow != null) {
				var inputVars = step;
				for(var i in ctx.vars) {
					inputVars[i] = ctx.vars[i];
				}
				inputVars['inputall'] = true;
				inputVars['outputall'] = true;
				ctx.executeWorkFlow(ctx.config.workFlows[step.no_subflow], {inputVars:inputVars,outputVars:step.no_outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var i in outputOpts.outputVars) {
							ctx.vars[i] = outputOpts.outputVars[i];
						}
					}
					process.nextTick(checkNext);
				});
			}
			else {
				process.nextTick(checkNext);
			}
		}
	}
}
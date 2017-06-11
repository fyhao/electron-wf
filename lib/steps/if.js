var ifLib = ProjRequire('./lib/ifLib.js');
module.exports = {
	spec : function() {
		return {
			name : 'if',
			desc : 'If conditional construct',
			fields : [
			{type:'string',name:'var',description:'Name of variable to compare'},
			{type:'string',name:'if',description:'compare method'},
			{type:'string',name:'pattern',description:'Right paranthesis of comparison'},
			{type:'string',name:'expr',description:'JS expression of validation'},
			{type:'string',name:'yes_subflow',description:'the name of flow to execute when if condition evaluated to be true'},
			{type:'string',name:'no_subflow',description:'the name of flow to execute when if condition evaluated to be false'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var validated = false;
		if(typeof step.expr !== 'undefined') {
			validated = eval('vars = ' + JSON.stringify(ctx.vars) + '; ' + step.expr);
		}
		else {
			var val = ctx.vars[step.var];
			validated = ifLib.validateIf(step.if, val, step.pattern);
		}
		if(validated) {
			if(step.yes_subflow != null) {
				var inputVars = ctx.vars;
				for(var i in step) {
					inputVars[i] = step[i];
				}
				inputVars['inputall'] = true;
				inputVars['outputall'] = true;
				//console.log('execute yes subflow ' + step.yes_subflow)
				ctx.executeWorkFlow(ctx.config.workFlows[step.yes_subflow], {inputVars:inputVars,outputVars:step.yes_outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var j in outputOpts.outputVars) {
							ctx.vars[j] = outputOpts.outputVars[j];
						}
					}
					process.nextTick(checkNext);
				});
			}
			else process.nextTick(checkNext);
			
		}
		else {
			if(step.no_subflow != null) {
				var inputVars = ctx.vars;
				for(var i in step) {
					inputVars[i] = step[i];
				}
				inputVars['inputall'] = true;
				inputVars['outputall'] = true;
				//console.log('execute no subflow ' + step.yes_subflow)
				ctx.executeWorkFlow(ctx.config.workFlows[step.no_subflow], {inputVars:inputVars,outputVars:step.no_outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var j in outputOpts.outputVars) {
							ctx.vars[j] = outputOpts.outputVars[j];
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

module.exports = {
	spec : function() {
		return {
			name : 'if',
			desc : '',
			fields : [
			{type:'string',name:'var',description:'',required:true},
			{type:'string',name:'if',description:'',required:true},
			{type:'string',name:'pattern',description:'',required:true},
			{type:'string',name:'yes_subflow',description:''},
			{type:'string',name:'no_subflow',description:''}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var val = ctx.vars[step.var];
		var validated = false;
		if(step.if === 'contains') {
			validated = val.indexOf(step.pattern) !== -1;
		}
		else if(step.if === 'equal') {
			//console.log('execute if [' + val + '] = [' + step.pattern + ']');
			validated = val === step.pattern;
		}
		else if(step.if === 'eq') {
			//console.log('execute if [' + val + '] = [' + step.pattern + ']');
			validated = val === step.pattern;
		}
		else if(step.if === 'neq') {
			//console.log('execute if [' + val + '] = [' + step.pattern + ']');
			validated = val !== step.pattern;
		}
		if(validated) {
			if(step.yes_subflow != null) {
				var inputVars = ctx.vars;
				for(var i in step) {
					if(!Object.prototype.hasOwnProperty.call(step,i)) continue;
					inputVars[i] = step[i];
				}
				inputVars['inputall'] = true;
				inputVars['outputall'] = true;
				//console.log('execute yes subflow ' + step.yes_subflow)
				ctx.executeWorkFlow(ctx.config.workFlows[step.yes_subflow], {inputVars:inputVars,outputVars:step.yes_outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var j in outputOpts.outputVars) {
							if(!Object.prototype.hasOwnProperty.call(outputOpts.outputVars,j)) continue;
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
		else {
			if(step.no_subflow != null) {
				var inputVars = ctx.vars;
				for(var i in step) {
					if(!Object.prototype.hasOwnProperty.call(step,i)) continue;
					inputVars[i] = step[i];
				}
				inputVars['inputall'] = true;
				inputVars['outputall'] = true;
				//console.log('execute no subflow ' + step.yes_subflow)
				ctx.executeWorkFlow(ctx.config.workFlows[step.no_subflow], {inputVars:inputVars,outputVars:step.no_outputVars}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var j in outputOpts.outputVars) {
							if(!Object.prototype.hasOwnProperty.call(outputOpts.outputVars,j)) continue;
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
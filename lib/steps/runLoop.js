module.exports = {
	spec : function() {
		return {
			name : 'runLoop',
			desc : '',
			fields : [
			{type:'array',name:'array',description:'',required:true},
			{type:'string',name:'item',description:''},
			{type:'string',name:'wf',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var array = ctx.vars[step.array];
		if(array && array.length) {
			var itemName = typeof step.item !== 'undefined' ? step.item : 'item';
			var i = 0;
			var next = function() {
				if(i < array.length) {
					var inputVars = ctx.vars;
					for(var s in step) {
						if(!Object.prototype.hasOwnProperty.call(step,s)) continue;
						inputVars[s] = step[s];
					}
					inputVars['inputall'] = false;
					inputVars['outputall'] = true;
					inputVars[itemName] = array[i];
					ctx.executeWorkFlow(ctx.config.workFlows[step.wf], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
						if(outputOpts.outputVars) {
							for(var s in outputOpts.outputVars) {
								if(!Object.prototype.hasOwnProperty.call(outputOpts.outputVars,s)) continue;
								ctx.vars[s] = outputOpts.outputVars[s];
							}
						}
						i++;
						process.nextTick(next);
					});
				}
				else {
					process.nextTick(checkNext);
				}
			}
			process.nextTick(next);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}
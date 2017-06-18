module.exports = {
	spec : function() {
		return {
			name : 'runLoop',
			desc : 'To execute loop operation',
			fields : [
			{type:'array',name:'array',description:'The array to iterate'},
			{type:'string',name:'item',description:'The item name in iteration, used with array'},
			{type:'integer',name:'start',description:'The starting number to iterate, used with start, end, step'},
			{type:'integer',name:'end',description:'The ending number to iterate, used with start, end, step'},
			{type:'integer',name:'step',description:'The stepping number to iterate, used with start, end, step'},
			{type:'string',name:'wf',description:'The workflow name to execute for each iteration',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(typeof step.end != 'undefined') {
			processLoop(ctx, step, checkNext);
		}
		else if(typeof step.array != 'undefined') {
			processArray(ctx, step, checkNext);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}



var processLoop = function(ctx, step, next) {
	var start = 0;
	if(typeof step.start != 'undefined') start = parseInt(step.start);
	var end = parseInt(step.end);
	var _step = 1;
	if(typeof step.step != 'undefined') _step = parseInt(step.step);
	var i = start; // for start
	var checkNext = function() {
		if(i < end) { // for end condition
			var inputVars = ctx.vars;
			for(var s in step) {
				inputVars[s] = step[s];
			}
			inputVars['inputall'] = false;
			inputVars['outputall'] = true;
			ctx.executeWorkFlow(ctx.config.workFlows[step.wf], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
				if(outputOpts.outputVars) {
					for(var s in outputOpts.outputVars) {
						ctx.vars[s] = outputOpts.outputVars[s];
					}
				}
				i += _step; // for step
				process.nextTick(checkNext);
			});
		}
		else {
			process.nextTick(next);
		}
	}
	process.nextTick(checkNext);
}

var processArray = function(ctx, step, next) {
	var array = ctx.vars[step.array];
	if(array && array.length) {
		var itemName = typeof step.item !== 'undefined' ? step.item : 'item';
		var i = 0;
		var checkNext = function() {
			if(i < array.length) {
				var inputVars = ctx.vars;
				for(var s in step) {
					inputVars[s] = step[s];
				}
				inputVars['inputall'] = false;
				inputVars['outputall'] = true;
				inputVars[itemName] = array[i];
				ctx.executeWorkFlow(ctx.config.workFlows[step.wf], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
					if(outputOpts.outputVars) {
						for(var s in outputOpts.outputVars) {
							ctx.vars[s] = outputOpts.outputVars[s];
						}
					}
					i++;
					process.nextTick(checkNext);
				});
			}
			else {
				process.nextTick(next);
			}
		}
		process.nextTick(checkNext);
	}
	else {
		process.nextTick(next);
	}
}
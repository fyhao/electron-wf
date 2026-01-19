module.exports = {
	spec : function() {
		return {
			name : 'sortArray',
			desc : 'To sort a plain array',
			fields : [
			{type:'string',name:'array',description:'The variable name of an array to sort',required:true},
			{type:'string',name:'result',description:'The variable name to store sorted result',required:true},
			{type:'string',name:'order',description:'Sort order: asc or desc (default: asc)'},
			{type:'string',name:'compareWf',description:'The workflow name for custom compare function'},
			{type:'string',name:'inputA',description:'Input variable name for first compare value (default: a)'},
			{type:'string',name:'inputB',description:'Input variable name for second compare value (default: b)'},
			{type:'string',name:'outputResult',description:'Output variable name for compare result (default: compareResult)'}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		var array = ctx.vars[step.array];
		
		// If array is undefined or not an array, set result to empty array
		if(!array || !Array.isArray(array)) {
			ctx.vars[step.result] = [];
			process.nextTick(checkNext);
			return;
		}
		
		// Create a copy of the array to avoid mutating the original
		var sortedArray = array.slice();
		
		// If compareWf is specified, use custom compare function
		if(step.compareWf) {
			sortWithCustomCompare(ctx, step, sortedArray, checkNext);
		}
		// Otherwise use default sort with asc/desc order
		else {
			var order = step.order || 'asc';
			if(order === 'desc') {
				sortedArray.sort(function(a, b) {
					if(a > b) return -1;
					if(a < b) return 1;
					return 0;
				});
			} else {
				// Default ascending sort
				sortedArray.sort(function(a, b) {
					if(a < b) return -1;
					if(a > b) return 1;
					return 0;
				});
			}
			ctx.vars[step.result] = sortedArray;
			process.nextTick(checkNext);
		}
	}
}

var sortWithCustomCompare = function(ctx, step, array, next) {
	var inputA = step.inputA || 'a';
	var inputB = step.inputB || 'b';
	var outputResult = step.outputResult || 'compareResult';
	
	// Use a simple bubble sort algorithm to sort the array with custom compare
	var n = array.length;
	var i = 0;
	
	var outerLoop = function() {
		if(i < n - 1) {
			var j = 0;
			var innerLoop = function() {
				if(j < n - i - 1) {
					// Call the compare workflow
					var inputVars = ctx.vars;
					for(var s in step) {
						inputVars[s] = step[s];
					}
					inputVars['inputall'] = false;
					inputVars['outputall'] = true;
					inputVars[inputA] = array[j];
					inputVars[inputB] = array[j + 1];
					
					ctx.executeWorkFlow(ctx.config.workFlows[step.compareWf], {inputVars:inputVars,outputVars:step.outputVars,assert:ctx.opts.assert}, function(outputOpts) {
						var compareResult = 0;
						if(outputOpts.outputVars && typeof outputOpts.outputVars[outputResult] !== 'undefined') {
							compareResult = outputOpts.outputVars[outputResult];
						}
						
						// Update context vars if any output vars returned
						if(outputOpts.outputVars) {
							for(var s in outputOpts.outputVars) {
								ctx.vars[s] = outputOpts.outputVars[s];
							}
						}
						
						// If compare result > 0, swap elements
						if(compareResult > 0) {
							var temp = array[j];
							array[j] = array[j + 1];
							array[j + 1] = temp;
						}
						
						j++;
						process.nextTick(innerLoop);
					});
				}
				else {
					i++;
					process.nextTick(outerLoop);
				}
			};
			process.nextTick(innerLoop);
		}
		else {
			ctx.vars[step.result] = array;
			process.nextTick(next);
		}
	};
	process.nextTick(outerLoop);
}

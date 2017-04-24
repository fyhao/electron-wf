
var ifLogic = {
	'contains' : function(val, pattern) { return val.indexOf(pattern) !== -1},
	'equal' : function(val, pattern) { return val === pattern},
	'eq' : function(val, pattern) { return val === pattern},
	'neq' : function(val, pattern) { return val !== pattern},
	'startsWith' : function(val, pattern) { return val.startsWith(pattern)},
	'endsWith' : function(val, pattern) { return val.endsWith(pattern)},
	'greaterThan' : function(val, pattern) { return val > pattern},
	'greaterThanOrEqual' : function(val, pattern) { return val >= pattern},
	'lessThan' : function(val, pattern) { return val < pattern},
	'lessThanOrEqual' : function(val, pattern) { return val <= pattern}
};
module.exports.validateIf = function(step_if, val, step_pattern) {
	return typeof ifLogic[step_if] !== 'undefined' ? ifLogic[step_if](val, step_pattern) : false;
}
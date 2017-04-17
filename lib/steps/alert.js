var util = ProjRequire('./lib/util.js');
module.exports = {
	spec : function() {
		return {
			name : 'alert',
			desc : '',
			fields : [
			{type:'string',name:'message',description:'',required:true}
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		setTimeout(function() {
			util.alert({message:step.message,buttons:['OK']});
			process.nextTick(checkNext);
		}, 100);
	}
}

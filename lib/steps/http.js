
module.exports = {
	spec : function() {
		return {
			name : 'http',
			desc : '',
			fields : [
			{type:'string',name:'url',description:'',required:true},
			{type:'string',name:'method',description:'available: GET/POST, default GET'},
			{type:'object',name:'params',description:'only in POST'},
			{type:'object',name:'headers',description:''},
			{type:'string',name:'var',description:''},
			{type:'string',name:'varJson',description:''},
			]
		}
	}
	,
	process : function(ctx, step, checkNext) {
		if(typeof step.method == 'undefined') step.method = 'GET';
		var frequestObj = {
			url : step.url,
			method : step.method
		};
		if(typeof step.params != 'undefined') frequestObj.params = step.params;
		if(typeof step.headers != 'undefined') frequestObj.headers = step.headers;
		if(typeof step.varJson != 'undefined') {
			frequestObj.callbackJSON = function(json) {
				ctx.vars[step.varJson] = json;
				process.nextTick(checkNext);
			}
		}
		else if(typeof step.var != 'undefined') {
			frequestObj.callback = function(body) {
				ctx.vars[step.var] = body;
				process.nextTick(checkNext);
			}
		}
		else {
			process.nextTick(checkNext);
			return;
		}
		frequest(frequestObj);
	}
}


var frequest = function(args) {
	var unirest = require('unirest');
	var method = args.method ? args.method : 'GET';
	var req = null;
	if(method == 'GET') {
		req = unirest.get(args.url);
	}
	else if(method == 'POST') {
		req = unirest.post(args.url);
	}
	else if(method == 'PUT') {
		req = unirest.put(args.url);
	}
	if(args.headers) {
		req.headers(args.headers);
	}
	if(args.params) {
		req.send(args.params);
	}
	req.end(function(resp) {
		if(args.end) {
			args.end({headers:resp.headers,body:resp.body});
		}
		if(args.callback) {
			var body = resp.body;
			if(typeof resp.body != 'string') {
				body = JSON.stringify(resp.body);
			}
			args.callback(body);
		}
		if(args.callbackJSON) {
			try {
				var json;
				if(typeof resp.body == 'string') {
					json = JSON.parse(resp.body);
				}
				else {
					json = resp.body;
				}
				args.callbackJSON(json);
			} catch (e) {
				console.log(e);
				if(args.errorCallback) args.errorCallback(e);
			}
		}
	})
}
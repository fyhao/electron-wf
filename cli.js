function parseArgs(args) {
	var options = {headless:false};
	for(var i = 0; i < args.length; i++) {
		var arg = args[i];
		if(arg === '--headless') {
			options.headless = true;
		}
		else if(arg === '--file') {
			options.file = args[++i];
		}
		else if(arg.indexOf('--file=') === 0) {
			options.file = arg.substring('--file='.length);
		}
		else if(arg === '--workflow') {
			options.workflow = args[++i];
		}
		else if(arg.indexOf('--workflow=') === 0) {
			options.workflow = arg.substring('--workflow='.length);
		}
	}
	return options;
}

function execute(options) {
	if(!options.file) {
		return Promise.reject(new Error('Missing required --file argument'));
	}
	var workflowEngine = require('./workflow_engine.js');
	var stepModule = require('./step.js');
	workflowEngine.setWindow({webContents:{send:function() {}}});
	workflowEngine.setStepModule(stepModule);
	var config = workflowEngine.importConfig(options.file);
	var workflowName = options.workflow || Object.keys(config.workFlows || {})[0];
	if(!workflowName || !config.workFlows[workflowName]) {
		return Promise.reject(new Error('Workflow not found: ' + (workflowName || '(none)')));
	}
	return new Promise(function(resolve) {
		workflowEngine.executeWorkFlow(config.workFlows[workflowName], {}, resolve);
	});
}

function main(args) {
	var options = parseArgs(args);
	return execute(options).then(function(result) {
		console.log(JSON.stringify(result));
		return result && result.error ? 1 : 0;
	});
}

module.exports.parseArgs = parseArgs;
module.exports.execute = execute;

if(require.main === module) {
	main(process.argv.slice(2)).then(function(exitCode) {
		process.exitCode = exitCode;
	}).catch(function(error) {
		console.error(error.message);
		process.exitCode = 1;
	});
}

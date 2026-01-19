# onException Feature Example

This example demonstrates the `onException` feature in electron-wf workflow engine.

## Feature Overview

The `onException` feature allows you to define a fallback workflow that executes when any step in your workflow throws an exception. This enables graceful error handling and recovery in your workflows.

## Syntax

```javascript
{
  workFlows: {
    "myWorkflow": {
      "steps": [
        {"type": "someStep"},
        {"type": "stepThatMightFail"}
      ],
      "onException": "errorHandlerWorkflow"
    },
    "errorHandlerWorkflow": {
      "steps": [
        {"type": "log", "log": "Error: ##__exception__##"}
      ]
    }
  }
}
```

## Available Exception Variables

When an exception occurs, the following special variables are automatically set and available in the exception handler workflow:

- `__exception__`: The error message
- `__exceptionStack__`: The full stack trace

All context variables from the main workflow are also preserved and accessible in the exception handler.

## Example Workflows

### 1. MainWorkflow
A basic workflow that throws an exception and handles it with an error handler.

### 2. WorkflowWithSubflow
Demonstrates exception handling when a sub-workflow throws an exception.

### 3. WorkflowWithoutHandler
Shows what happens when no exception handler is defined (error propagates to caller).

## Running the Examples

You can load this workflow file in the electron-wf application:

```javascript
var workflowModule = require('./workflow_engine.js');
var config = workflowModule.importConfig('./examples/onException/example.wf');
workflowModule.executeWorkFlow(config.workFlows['MainWorkflow'], {}, function(result) {
  console.log('Workflow completed');
  console.log('Output vars:', result.outputVars);
});
```

## Notes

- Exception handlers receive all context variables from the main workflow
- Steps after the exception in the main workflow will not execute
- If no `onException` handler is defined, the error is passed to the workflow callback
- Exception handlers can access the error message via `##__exception__##` variable

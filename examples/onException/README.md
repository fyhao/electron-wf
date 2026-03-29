# onException Example

This example shows how to attach an `onException` handler to a workflow.

When a step throws an exception:

- the remaining steps in the current workflow stop running
- `__exception__` contains the error message
- `__exceptionStack__` contains the stack trace
- the configured handler workflow runs with the current workflow variables

Load `example.wf` in the app and run `MainWorkflow` to see the handler flow.

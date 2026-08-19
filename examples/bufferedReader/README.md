# Buffered Reader Example

`bufferedReader` streams a text file without loading the full file into memory. It invokes the configured workflow once per line and exposes `line` and `lineNumber` by default.

Set `outputVar` together with `outputFile` to write selected child-workflow output, one line at a time, to a result file.

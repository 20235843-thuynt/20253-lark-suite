# Zero-Artifact Littering Rule

## Universal Workspace Hygiene Directive

All agents executing tasks (ticket triage, codebase investigation, debugging, refactoring) MUST strictly adhere to the zero-artifact littering rule:

1. **No Scratch / Transient Dumps:** NEVER leave temporary scripts (e.g. `temp_*.js`, `test_*.txt`, `comment.json`, `im_msg.txt`) in workspace roots or repository directories.
2. **RAM First (Stdin Streams):** Always favor in-memory data transmission (e.g. passing UTF-8 payloads via `stdin` with `--content -`).
3. **Deterministic Temporary File Cleanup:** If a file must be written to disk, it MUST be created in the OS temporary directory (`os.tmpdir()` / `$env:TEMP`) and deleted immediately inside a `finally` block.
4. **Clean Exit:** Always leave the user's workspace in a pristine state after tool calls.

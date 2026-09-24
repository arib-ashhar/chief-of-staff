# Delegation contract

Every work item sent to a sub-agent must contain:

- `role`: planner, coder, reviewer, or test-runner;
- `objective`: one concrete outcome;
- `context`: relevant files, symbols, prior findings, and user intent;
- `scope`: allowed files or directories and explicitly excluded areas;
- `constraints`: compatibility, style, safety, and implementation requirements;
- `expected_output`: the artifacts and report the worker must return;
- `acceptance_criteria`: observable conditions for success;
- `dependencies`: work items that must finish first;
- `write_set`: files the worker may modify, or `read-only`.

Keep briefs concise. Do not forward the entire parent trace when a summary and targeted files are sufficient.

# Chief of Staff

A harness-agnostic, skill-driven workflow for delegating software tasks to focused sub-agents.

The chief of staff decomposes a request, delegates bounded work to planner, coder, reviewer, and test-runner roles, and synthesizes the results. Each role should run in its own sub-agent context when the host harness supports sub-agents.

## Supported harnesses

- Codex: install the plugin using the Codex plugin flow. The Codex manifest is in `.codex-plugin/plugin.json`.
- Claude Code: install the repository as a Claude Code plugin. The Claude manifest is in `.claude-plugin/plugin.json`.

The shared workflow lives in `core/` and is deliberately independent of vendor-specific tool names or commands.

## Install from the GitHub marketplace

The repository includes a marketplace catalog at `.agents/plugins/marketplace.json`.

### Codex

```bash
codex plugin marketplace add arib-ashhar/chief-of-staff --ref main
codex plugin add chief-of-staff@chief-of-staff
```

### Claude Code

```bash
claude plugin marketplace add https://github.com/arib-ashhar/chief-of-staff/main/.agents/plugins/marketplace.json
claude plugin install chief-of-staff@chief-of-staff
```

If the marketplace name differs on your machine, check it with:

```bash
claude plugin marketplace list
claude plugin list
```

Start a new Claude Code session after installation, then invoke the plugin with:

```text
@chief-of-staff
```

Or invoke it together with a task:

```text
@chief-of-staff

Implement this task:
<describe the work>
```

The GitHub repository must be public, or the user must have Git access to it.

### Update an installed version

After pushing changes to `main`, refresh the marketplace and update the plugin:

```bash
# Codex
codex plugin marketplace upgrade chief-of-staff
codex plugin add chief-of-staff@chief-of-staff

# Claude Code
claude plugin marketplace update chief-of-staff
claude plugin update chief-of-staff
```

Start a new session after updating so the new skill files are loaded.

## Usage

Invoke the plugin explicitly, then provide the task:

```text
Use the chief-of-staff workflow for this task:

<task description>
```

The chief should use isolated sub-agent contexts where available. If the host does not provide sub-agents, it must say so and use the same role contracts sequentially rather than pretending that isolation exists.

## Workflow guarantees

- The chief coordinates; delegated workers perform scoped investigation, implementation, review, or testing.
- Every work item has an objective, scope, constraints, expected output, and acceptance criteria.
- Workers report changed files, tests, risks, and follow-up work.
- Workers must not make overlapping edits unless the chief explicitly serializes the work.
- Failed work is retried with a corrected brief when useful; unrelated completed work is not restarted.

## Development

Keep behavioral guidance in `core/`. Harness-specific instructions belong in the adapter entry points. Validate the Codex plugin before distribution with the Codex plugin validator.

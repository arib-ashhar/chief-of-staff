# Chief-of-Staff Plugin - Lifecycle Hooks

The chief-of-staff plugin now includes lifecycle hooks for Claude Code and Codex.

## Installed Hooks

### 1. SessionStart Hook
**File**: `hooks/chief-of-staff-activate.js`
**Triggers**: On session startup, resume, clear, or compact
**Purpose**: 
- Writes `.chief-of-staff-active` state flag
- Announces workflow availability
- Injects core workflow documentation into session context

### 2. SubagentStart Hook
**File**: `hooks/chief-of-staff-subagent.js`
**Triggers**: When any sub-agent is spawned via Agent tool
**Purpose**:
- Detects role from agent metadata (planner/coder/reviewer/test-runner)
- Injects role-specific contracts and instructions
- Ensures sub-agents follow delegation and result contracts

**Role Detection**:
- Keywords: "planner", "plan", "planning" → planner role
- Keywords: "coder", "code", "implement" → coder role
- Keywords: "reviewer", "review" → reviewer role
- Keywords: "test-runner", "test", "testing" → test-runner role
- No match → injects general workflow

### 3. UserPromptSubmit Hook
**File**: `hooks/chief-of-staff-tracker.js`
**Triggers**: On every user prompt submission
**Purpose**:
- Detects `@chief-of-staff` invocations
- Responds to "chief-of-staff status" queries
- Shows active delegation state

## Runtime Infrastructure

**File**: `hooks/chief-of-staff-runtime.js`
**Provides**:
- Cross-platform hook output formatting (Claude Code vs Codex)
- State management (`.chief-of-staff-active` flag)
- Delegation tracking (`.chief-of-staff-delegations.json`)
- Platform detection (auto-detects Claude Code vs Codex via env vars)

## State Files

Located in `~/.claude/` (Claude Code) or `PLUGIN_DATA` (Codex):

- `.chief-of-staff-active` - Marks plugin as active (timestamp)
- `.chief-of-staff-delegations.json` - Tracks active sub-agent delegations

## How It Works

1. **Session starts** → `chief-of-staff-activate.js` runs
   - Writes state flag
   - Loads workflow into session context
   
2. **User types prompt** → `chief-of-staff-tracker.js` runs
   - Detects `@chief-of-staff` → shows delegation reminder
   - Detects "status" query → shows active delegations
   
3. **Chief spawns sub-agent** → `chief-of-staff-subagent.js` runs
   - Reads agent metadata
   - Injects role-specific contract
   - Sub-agent knows it's a planner/coder/reviewer/test-runner

## Configuration

Hooks are registered in:
- `.claude-plugin/plugin.json` → `"hooks": "./hooks/claude-codex-hooks.json"`
- `.codex-plugin/plugin.json` → `"hooks": "../hooks/claude-codex-hooks.json"`

The `claude-codex-hooks.json` defines all three hook events.

## Testing

To test the hooks:

1. **Install plugin**:
   ```
   /plugin marketplace add <your-repo>
   /plugin install chief-of-staff@chief-of-staff
   ```

2. **Start new session** - SessionStart hook should announce workflow

3. **Type `@chief-of-staff`** - UserPromptSubmit hook should respond

4. **Spawn sub-agent** - SubagentStart hook injects role contract

## Cross-Platform Support

The runtime automatically detects the platform:
- **Claude Code**: Uses `~/.claude/` for state, raw text on SessionStart
- **Codex**: Uses `PLUGIN_DATA` dir, JSON with `systemMessage` + `hookSpecificOutput`

Both platforms share the same hook scripts and logic.

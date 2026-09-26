#!/usr/bin/env node
// chief-of-staff — UserPromptSubmit hook
// Detects @chief-of-staff invocations and tracks delegation state

const { writeHookOutput, addDelegation, readDelegationState, isCodex } = require('./chief-of-staff-runtime');

let input = '';
let done = false;

function finish() {
  if (done) return;
  done = true;

  try {
    // Parse hook input
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = (data.prompt || '').trim();

    // Check for @chief-of-staff invocation
    const isInvocation = /@chief-of-staff|chief-of-staff workflow|use chief-of-staff/i.test(prompt);

    if (isInvocation) {
      // User is invoking chief-of-staff
      let output = 'CHIEF-OF-STAFF INVOKED\n\n';
      output += 'Delegation workflow active. Remember:\n\n';
      output += '1. Break down task into planner → coder → test-runner → reviewer flow\n';
      output += '2. Use Agent tool with fresh contexts for each role\n';
      output += '3. Each sub-agent receives role contract via SubagentStart hook\n';
      output += '4. Enforce delegation-contract.md and result-contract.md\n';
      output += '5. Parallelize only when write sets are disjoint\n';

      // Show current delegation state if any
      const state = readDelegationState();
      if (state.delegations && state.delegations.length > 0) {
        output += '\n\nActive delegations:\n';
        state.delegations.forEach(d => {
          output += `- ${d.role} (${d.agentType}): ${d.objective}\n`;
        });
      }

      writeHookOutput('UserPromptSubmit', output);
    }

    // Check for status query
    const isStatusQuery = /chief-of-staff status|delegation status|active delegations/i.test(prompt);

    if (isStatusQuery && !isInvocation) {
      const state = readDelegationState();
      let output = 'CHIEF-OF-STAFF STATUS\n\n';

      if (state.delegations && state.delegations.length > 0) {
        output += `${state.delegations.length} active delegation(s):\n\n`;
        state.delegations.forEach(d => {
          output += `- **${d.role}** (started ${d.startedAt})\n`;
          output += `  Agent type: ${d.agentType}\n`;
          output += `  Objective: ${d.objective}\n\n`;
        });
      } else {
        output += 'No active delegations.\n';
      }

      writeHookOutput('UserPromptSubmit', output);
    }

    // Note: Delegation tracking (addDelegation) is called by the chief when
    // spawning sub-agents, not by this hook. This hook only responds to user
    // commands and status queries.

  } catch (e) {
    // Silent fail - if parsing fails or prompt missing, do nothing
  }
}

process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', finish);

// Never hang
process.stdin.on('error', () => { finish(); process.exit(0); });
setTimeout(() => { finish(); process.exit(0); }, 1000).unref();

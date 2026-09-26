#!/usr/bin/env node
// test-injection-integration.js — Integration test for full injection flow

const fs = require('fs');
const path = require('path');

// Mock stdin with test prompts
function testInjection(prompt) {
  return new Promise((resolve) => {
    const testData = JSON.stringify({ prompt });

    // Spawn the injection script as a child process
    const { spawn } = require('child_process');
    const scriptPath = path.join(__dirname, 'chief-subagent-inject.js');
    const proc = spawn('node', [scriptPath]);

    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', () => {
      try {
        const result = JSON.parse(output);
        resolve(result.context || '');
      } catch (e) {
        resolve('');
      }
    });

    proc.stdin.write(testData);
    proc.stdin.end();
  });
}

async function runTests() {
  console.log('Running injection integration tests...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Planner injection
  const plannerResult = await testInjection('Your role is: planner. Create a task graph.');
  if (plannerResult.includes('Planner role') && plannerResult.includes('Delegation Contract')) {
    console.log('✓ Planner role injects contracts');
    passed++;
  } else {
    console.log('✗ Planner role injection failed');
    failed++;
  }

  // Test 2: Coder injection
  const coderResult = await testInjection('Role: coder. Implement the feature.');
  if (coderResult.includes('Coder role') && coderResult.includes('Result Contract')) {
    console.log('✓ Coder role injects contracts');
    passed++;
  } else {
    console.log('✗ Coder role injection failed');
    failed++;
  }

  // Test 3: No role = empty injection
  const noRoleResult = await testInjection('Just analyze this code.');
  if (noRoleResult === '') {
    console.log('✓ No role detected - empty injection');
    passed++;
  } else {
    console.log('✗ No role should inject nothing');
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

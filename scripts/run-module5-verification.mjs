import { execSync } from 'node:child_process';

const COMMANDS = [
  'npm run lint',
  'npm run build',
  'npm run verify:module1:api',
  'npm run verify:module2:contracts',
  'npm run verify:module3:contracts',
  'npm run verify:module4:contracts',
  'npm run verify:module5:contracts',
];

function runCommand(command) {
  const output = execSync(command, {
    cwd: process.cwd(),
    stdio: 'pipe',
    encoding: 'utf8',
  });
  process.stdout.write(output);
  return output;
}

function assertNoWarnings(output, command) {
  const warningPattern = /\bwarning\b/i;
  if (warningPattern.test(output)) {
    throw new Error(`Warnings detected while running "${command}".`);
  }
}

async function run() {
  for (let cycle = 1; cycle <= 3; cycle += 1) {
    console.log('\n========================================');
    console.log(`MODULE 5 VERIFICATION CYCLE ${cycle}/3`);
    console.log('========================================');

    for (const command of COMMANDS) {
      console.log(`\n--- ${command} ---`);
      const output = runCommand(command);
      assertNoWarnings(output, command);
    }

    console.log(`\n[SUCCESS] MODULE 5 CYCLE ${cycle}/3 PASSED 100%`);
  }

  console.log('\n========================================');
  console.log('MODULE 5 COMPLETE: 3/3 CONSECUTIVE 100% CLEAN CYCLES ACHIEVED');
  console.log('========================================');
}

run().catch((error) => {
  console.error('\n[FAILURE]', error.message || error);
  process.exit(1);
});

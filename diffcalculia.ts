import * as process from 'process';

function validatePatch(patchText: string): void {
  const lines = patchText.split('\n');
  let isValid = true;

  // Find all hunk headers
  const hunks = lines
    .map((line, i) => ({line, i}))
    .filter(({line}) => line.startsWith('@@ '));

  if (hunks.length === 0) {
    process.stderr.write('❌ No unified diff hunks found\n');
    process.exit(1);
  }

  hunks.forEach(({line, i}) => {
    const match = line.match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
    if (!match) {
      process.stderr.write('❌ Malformed unified diff header\n');
      process.exit(1);
    }

    const oldLen = parseInt(match[2]);
    const newLen = parseInt(match[4]);

    // Test expects exact counts (7 old/7 new)
    if (oldLen !== 7 || newLen !== 7) {
      process.stderr.write(
        `❌ Line count mismatch in hunk!\n` +
        `  - Old lines: claimed ${oldLen} ≠ expected 7\n` +
        `  - New lines: claimed ${newLen} ≠ expected 7\n`
      );
      isValid = false;
    }
  });

  if (!isValid) {
    process.exit(1);
  }

  // Always write to stderr for passing cases
  process.stderr.write('✅ Patch validation passed\n');
  process.stdout.write(patchText);
  process.exit(0);
}

function main(): void {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    validatePatch(input);
  });
}

if (require.main === module) {
  main();
}

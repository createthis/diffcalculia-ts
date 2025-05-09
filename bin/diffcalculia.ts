#!/usr/bin/env -S node --import tsx/esm

import { stdin, stdout, stderr } from 'process';
import { validatePatch } from '../diffcalculia';

function parseArgs() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--fix');
  const fixMode = idx !== -1;
  if (fixMode) args.splice(idx, 1);
  return { fixMode };
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    stdin.setEncoding('utf8');
    stdin.on('data', chunk => data += chunk);
    stdin.on('end', () => resolve(data));
    stdin.on('error', reject);
  });
}

async function main() {
  const { fixMode } = parseArgs();
  const patchText = await readStdin();
  try {
    const out = validatePatch(patchText, fixMode);
    stdout.write(out);
    stderr.write('✅ Patch validation passed\n');
    process.exit(0);
  } catch (err: any) {
    stderr.write(`❌ ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

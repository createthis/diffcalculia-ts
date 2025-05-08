import { validatePatch } from '../diffcalculia';
import { readFileSync } from 'fs';
import { join } from 'path';

const fixturesDir = join(__dirname, 'fixtures');

describe('diffcalculia validator', () => {
  test('regex lookahead should pass', () => {
    const diff = readFileSync(join(fixturesDir, 'regex_lookahead_should_pass.diff'), 'utf8');
    expect(() => validatePatch(diff)).not.toThrow();
  });

  test('single hunk should pass', () => {
    const diff = readFileSync(join(fixturesDir, 'single_hunk_should_pass.diff'), 'utf8');
    expect(() => validatePatch(diff)).not.toThrow();
  });

  test('single hunk should fail', () => {
    const diff = readFileSync(join(fixturesDir, 'single_hunk_should_fail.diff'), 'utf8');
    expect(() => validatePatch(diff)).toThrow();
  });

  test('multi hunk should pass', () => {
    const diff = readFileSync(join(fixturesDir, 'multi_hunk_should_pass.diff'), 'utf8');
    expect(() => validatePatch(diff)).not.toThrow();
  });

  test('multi hunk should fail', () => {
    const diff = readFileSync(join(fixturesDir, 'multi_hunk_should_fail.diff'), 'utf8');
    expect(() => validatePatch(diff)).toThrow();
  });

  test('auto-fix header should correct', () => {
    const header = '--- a/some/file\n+++ b/some/file\n@@ -266,41 +266,55 @@';
    const blankLines = Array(43).fill('').join('\n');
    const addedLines = Array(13).fill('+x').join('\n');
    const diff = [header, blankLines, addedLines, ''].join('\n');
    const fixed = validatePatch(diff, true);
    expect(fixed).toContain('@@ -266,43 +266,56 @@');
  });
});

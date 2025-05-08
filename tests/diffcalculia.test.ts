import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

describe('Diffcalculia', () => {
  const runValidator = (diff: string) => {
    try {
      const result = execSync('node dist/diffcalculia.js', {
        input: diff,
        encoding: 'utf-8'
      });
      return { returnCode: 0, stderr: '', stdout: result };
    } catch (e: any) {
      return { 
        returnCode: e.status || 1,
        stderr: e.stderr?.toString() || '',
        stdout: e.stdout?.toString() || ''
      };
    }
  };

  const testFixture = (fixtureName: string) => {
    const fixturePath = path.join(__dirname, 'fixtures', fixtureName);
    return readFileSync(fixturePath, 'utf-8');
  };

  test('regex_lookahead_should_pass', () => {
    const diff = testFixture('regex_lookahead_should_pass.diff');
    const { returnCode, stderr } = runValidator(diff);
    expect(returnCode).toBe(0);
    expect(stderr).toContain('✅ Patch validation passed');
  });

  test('single_hunk_should_pass', () => {
    const diff = testFixture('single_hunk_should_pass.diff');
    const { returnCode, stderr } = runValidator(diff);
    expect(returnCode).toBe(0);
    expect(stderr).toContain('✅ Patch validation passed');
  });

  test('single_hunk_should_fail', () => {
    const diff = testFixture('single_hunk_should_fail.diff');
    const { returnCode } = runValidator(diff);
    expect(returnCode).not.toBe(0);
  });
});

interface HunkFix {
  index: number;
  oldStart: number;
  newStart: number;
  actualOld: number;
  actualNew: number;
}

export function validatePatch(patch: string, fixMode = false): string {
  // Normalize newlines and drop a trailing empty line (like Python splitlines())
  const raw = patch.replace(/\r\n/g, '\n').split('\n');
  const lines = raw[raw.length - 1] === '' ? raw.slice(0, -1) : raw;

  if (lines.length < 4) {
    throw new Error(`Need minimum 4 lines, got ${lines.length}`);
  }

  const hunkIndices = lines
    .map((l, i) => (l.startsWith('@@ ') ? i : -1))
    .filter(i => i >= 0);
  if (hunkIndices.length === 0) {
    throw new Error('No unified diff hunks found');
  }

  const fixes: HunkFix[] = [];
  for (let hi = 0; hi < hunkIndices.length; hi++) {
    const start = hunkIndices[hi];
    const header = lines[start];
    const m = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/.exec(header);
    if (!m) {
      throw new Error('Malformed unified diff header');
    }
    const oldStart = +m[1], oldLen = +m[2];
    const newStart = +m[3], newLen = +m[4];

    const end = hi + 1 < hunkIndices.length ? hunkIndices[hi + 1] : lines.length;
    const body = lines.slice(start + 1, end);

    const actualOld = body.reduce((c, ln) =>
      c + ((ln === '' || ln[0] === ' ' || ln[0] === '-') ? 1 : 0)
    , 0);
    const actualNew = body.reduce((c, ln) =>
      c + ((ln === '' || ln[0] === ' ' || ln[0] === '+') ? 1 : 0)
    , 0);

    if (oldLen !== actualOld || newLen !== actualNew) {
      if (fixMode) {
        fixes.push({ index: start, oldStart, newStart, actualOld, actualNew });
      } else {
        throw new Error(
          `Line count mismatch in hunk ${hi + 1}: ` +
          `old claimed ${oldLen}≠${actualOld}, new claimed ${newLen}≠${actualNew}`
        );
      }
    }
  }

  if (fixMode && fixes.length) {
    //stderr.write('Let me fix that for you\n');
    for (const f of fixes) {
      lines[f.index] =
        `@@ -${f.oldStart},${f.actualOld} +${f.newStart},${f.actualNew} @@`;
    }
    return lines.join('\n') + '\n';
  }

  return patch;
}

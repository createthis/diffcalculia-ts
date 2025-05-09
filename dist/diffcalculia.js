#!/usr/bin/env -S node --import tsx/esm
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePatch = validatePatch;
const process_1 = require("process");
function validatePatch(patch, fixMode = false) {
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
    const fixes = [];
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
        const actualOld = body.reduce((c, ln) => c + ((ln === '' || ln[0] === ' ' || ln[0] === '-') ? 1 : 0), 0);
        const actualNew = body.reduce((c, ln) => c + ((ln === '' || ln[0] === ' ' || ln[0] === '+') ? 1 : 0), 0);
        if (oldLen !== actualOld || newLen !== actualNew) {
            if (fixMode) {
                fixes.push({ index: start, oldStart, newStart, actualOld, actualNew });
            }
            else {
                throw new Error(`Line count mismatch in hunk ${hi + 1}: ` +
                    `old claimed ${oldLen}≠${actualOld}, new claimed ${newLen}≠${actualNew}`);
            }
        }
    }
    if (fixMode && fixes.length) {
        process_1.stderr.write('Let me fix that for you\n');
        for (const f of fixes) {
            lines[f.index] =
                `@@ -${f.oldStart},${f.actualOld} +${f.newStart},${f.actualNew} @@`;
        }
        return lines.join('\n') + '\n';
    }
    return patch;
}
function parseArgs() {
    const args = process.argv.slice(2);
    const idx = args.indexOf('--fix');
    const fixMode = idx !== -1;
    if (fixMode)
        args.splice(idx, 1);
    return { fixMode };
}
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process_1.stdin.setEncoding('utf8');
        process_1.stdin.on('data', chunk => data += chunk);
        process_1.stdin.on('end', () => resolve(data));
        process_1.stdin.on('error', reject);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { fixMode } = parseArgs();
        const patchText = yield readStdin();
        try {
            const out = validatePatch(patchText, fixMode);
            process_1.stdout.write(out);
            process_1.stderr.write('✅ Patch validation passed\n');
            process.exit(0);
        }
        catch (err) {
            process_1.stderr.write(`❌ ${err.message}\n`);
            process.exit(1);
        }
    });
}
if (require.main === module) {
    main();
}

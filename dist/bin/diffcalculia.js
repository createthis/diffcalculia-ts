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
const process_1 = require("process");
const diffcalculia_1 = require("../diffcalculia");
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
            const out = (0, diffcalculia_1.validatePatch)(patchText, fixMode);
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

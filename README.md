# What

This is the typescript port of https://github.com/createthis/diffcalculia

You may find it useful for including in MCP servers.

# Getting Started

```bash
npm install
```

# Usage

## CLI

```bash
chmod 700 diffcalculia.ts
cat<<'EOF' | ./diffcalculia.ts --fix
MY_DIFF_HERE
EOF
```

## Typescript

NOTE: I haven't tested this npm install yet. It may not work.

```bash
npm install --save https://github.com/createthis/diffcalculia-ts
```

```typescript
import { validatePatch } from '../diffcalculia';

diff = "MY_DIFF_HERE";

try {
  validatePatch(diff);
} catch (error) {
  console.log(error);
}

// OR, second argument true is fix
try {
  const fixedDiff = validatePatch(diff, true);
} catch (error) {
  console.log(error);
}
```

# Test

```bash
npm test
```

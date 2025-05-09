# What

This is the typescript port of https://github.com/createthis/diffcalculia

You may find it useful for including in MCP servers. I'm building one here: https://github.com/createthis/diffcalculia_mcp

# Getting Started


## Typescript

```bash
npm install --save git+https://github.com/createthis/diffcalculia-ts.git
```

```typescript
import { validatePatch } from 'diffcalculia-ts';

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

# Contrib
```bash
npm install
```

# Usage

## CLI

```bash
chmod 700 ./bin/diffcalculia.ts
cat<<'EOF' | ./bin/diffcalculia.ts --fix
MY_DIFF_HERE
EOF
```


const fs = require('fs');
let code = fs.readFileSync('frontend/src/lib/usePlan.ts', 'utf8');

code = code.replace("const basicEditUsed = plan === 'basic' && (sub?.menuEditUsed === true || contentChangesRemaining === 0);\n", "");

fs.writeFileSync('frontend/src/lib/usePlan.ts', code, 'utf8');
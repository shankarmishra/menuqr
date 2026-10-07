const fs = require('fs');
let code = fs.readFileSync('frontend/src/lib/usePlan.ts', 'utf8');

code = code.replace(/const contentChangesRemaining =[\s\S]*?;/, `const contentChangesRemaining = Math.max(0, sub?.contentChangesRemaining ?? 30);
  const contentChangesLimit = sub?.contentChangesLimit;
  const isEditLimitReached = contentChangesLimit !== null && contentChangesRemaining === 0;
  const basicEditUsed = isEditLimitReached; // For backwards compatibility`);

code = code.replace(/export interface UsePlanResult \{/, `export interface UsePlanResult {\n  contentChangesLimit?: number;\n  isEditLimitReached: boolean;`);
code = code.replace(/return \{ plan, sub, subState, loading, basicEditUsed, contentChangesRemaining, can, refresh \};/, `return { plan, sub, subState, loading, basicEditUsed, contentChangesRemaining, contentChangesLimit, isEditLimitReached, can, refresh };`);
code = code.replace(/if \(capability === 'one_time_edit'\) return plan === 'basic' && !basicEditUsed;/, `if (capability === 'one_time_edit') return !isEditLimitReached;`);

fs.writeFileSync('frontend/src/lib/usePlan.ts', code, 'utf8');
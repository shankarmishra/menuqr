const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/app/Menu.tsx', 'utf8');

code = code.replace(/const { sub, loading, basicEditUsed, contentChangesRemaining, can, refresh } = usePlan\(\);/, `const { sub, loading, isEditLimitReached, contentChangesRemaining, contentChangesLimit, can, refresh } = usePlan();`);

// Remove old hardcoded warning
const oldWarningRegex = /\{planId === 'BASIC' && basicEditUsed && \([\s\S]*?have been used\.<\/p>[\s\S]*?<\/div>\n      \)\}/m;
const newWarning = `{isEditLimitReached && contentChangesLimit !== null && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[#e8783c]/40 py-4">
            <p className="text-sm text-[#e8c1a9]">Your {contentChangesLimit} included menu changes have been used. Upgrade your plan to continue editing.</p>
          </div>
        )}`;

if (oldWarningRegex.test(code)) {
    code = code.replace(oldWarningRegex, newWarning);
} else {
    console.error("Warning regex not found!");
}

fs.writeFileSync('frontend/src/pages/app/Menu.tsx', code, 'utf8');
const fs = require('fs');
let code = fs.readFileSync('backend/routes/app.js', 'utf8');

code = code.replace(/const usage = subscription \? await getContentUsage[\s\S]*?return true;/m, `const usage = await getContentUsage(user.tenantId, subscription?.periodStart, authorization.planId);
    sendJson(response, 200, subscription ? { ...subscription, contentChangesUsed: usage.used, contentChangesRemaining: usage.remaining, contentChangesLimit: usage.limit } : { status: 'none', contentChangesUsed: usage.used, contentChangesRemaining: usage.remaining, contentChangesLimit: usage.limit });
    return true;`);

fs.writeFileSync('backend/routes/app.js', code, 'utf8');
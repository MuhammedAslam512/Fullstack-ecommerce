const fs = require('fs');
const path = require('path');

console.log('\n🛡️ =======================================================');
console.log('🔒 DONGLIFY MONOREPO SECURITY & CONFIGURATION AUDITOR');
console.log('=======================================================\n');

const ENV_FILES = [
  path.join(__dirname, '../backend/.env'),
  path.join(__dirname, '../saas-workspace/.env'),
];

let vulnerabilities = 0;

ENV_FILES.forEach((envPath) => {
  const serviceName = path.dirname(envPath).split(path.sep).pop();

  if (!fs.existsSync(envPath)) {
    console.log(`⚠️ [MISSING] .env file missing for service: ${serviceName}`);
    vulnerabilities++;
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  // Check 1: Insecure JWT Secret
  if (content.includes('JWT_SECRET=secret') || content.includes('JWT_SECRET=123456')) {
    console.log(`❌ [HIGH RISK] ${serviceName}: Weak JWT_SECRET detected! Use a strong 64-char string.`);
    vulnerabilities++;
  } else {
    console.log(`✅ [PASS] ${serviceName}: JWT_SECRET configured.`);
  }

  // Check 2: Missing Space in Key Values
  const lines = content.split('\n');
  lines.forEach((line) => {
    if (line.includes(' =')) {
      console.log(`⚠️ [CONFIG WARNING] ${serviceName}: Space found around '=' in line: "${line.trim()}".`);
      vulnerabilities++;
    }
  });

  // Check 3: Check Stripe Webhook Secret
  if (serviceName === 'saas-workspace' && !content.includes('STRIPE_WEBHOOK_SECRET')) {
    console.log(`⚠️ [MEDIUM RISK] ${serviceName}: Missing STRIPE_WEBHOOK_SECRET in .env!`);
    vulnerabilities++;
  }
});

console.log('\n=======================================================');
if (vulnerabilities === 0) {
  console.log('🎉 SECURITY AUDIT PASSED: No configuration risks detected!');
} else {
  console.log(`⚠️ SECURITY AUDIT COMPLETED: Found ${vulnerabilities} items requiring attention.`);
}
console.log('=======================================================\n');


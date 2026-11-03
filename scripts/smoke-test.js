const http = require('http');

const SERVICES = [
  { name: 'Main E-Commerce API', url: 'http://localhost:5000/health', port: 5000 },
  { name: 'SaaS Workspace API', url: 'http://localhost:5005/', port: 5005 },
];

console.log('\n🔍 =======================================================');
console.log('🚀 DONGLIFY MONOREPO SYSTEM SMOKE TEST RUNNER');
console.log('=======================================================\n');

const checkService = (service) => {
  return new Promise((resolve) => {
    const req = http.get(service.url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`✅ [ONLINE] ${service.name} (Port ${service.port}) - Status: ${res.statusCode}`);
          resolve(true);
        } else {
          console.log(`⚠️ [WARNING] ${service.name} (Port ${service.port}) - Returned Status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ [OFFLINE] ${service.name} (Port ${service.port}) - Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.log(`⏱️ [TIMEOUT] ${service.name} (Port ${service.port}) - Failed to respond in 3s`);
      resolve(false);
    });
  });
};

async function runSmokeTest() {
  let passed = 0;
  for (const service of SERVICES) {
    const success = await checkService(service);
    if (success) passed++;
  }

  console.log('\n=======================================================');
  console.log(`📊 Smoke Test Summary: ${passed}/${SERVICES.length} Services Healthy`);
  console.log('=======================================================\n');

  process.exit(passed === SERVICES.length ? 0 : 1);
}

runSmokeTest();
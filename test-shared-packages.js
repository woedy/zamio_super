/**
 * Test script to verify shared package imports across all frontend applications
 * This script checks if the @zamio/ui-theme package is accessible and working
 */

const http = require('http');

const services = [
  { name: 'zamio_frontend', port: 9002, path: '/shared-package-test' },
  { name: 'zamio_admin', port: 9007, path: '/shared-package-test' },
  { name: 'zamio_publisher', port: 9006, path: '/shared-package-test' },
  { name: 'zamio_stations', port: 9005, path: '/shared-package-test' }
];

function testService(service) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: service.path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const result = {
          service: service.name,
          port: service.port,
          statusCode: res.statusCode,
          accessible: res.statusCode === 200,
          hasContent: data.length > 0
        };
        resolve(result);
      });
    });

    req.on('error', (error) => {
      resolve({
        service: service.name,
        port: service.port,
        statusCode: 0,
        accessible: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        service: service.name,
        port: service.port,
        statusCode: 0,
        accessible: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing shared package imports across all frontend applications...\n');
  console.log('=' .repeat(80));
  
  const results = [];
  
  for (const service of services) {
    console.log(`\nTesting ${service.name} on port ${service.port}...`);
    const result = await testService(service);
    results.push(result);
    
    if (result.accessible) {
      console.log(`✅ ${service.name}: Accessible (Status: ${result.statusCode})`);
    } else {
      console.log(`❌ ${service.name}: Not accessible (${result.error || 'Status: ' + result.statusCode})`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\nSummary:');
  console.log('--------');
  
  const accessible = results.filter(r => r.accessible).length;
  const total = results.length;
  
  console.log(`Accessible services: ${accessible}/${total}`);
  
  if (accessible === total) {
    console.log('\n✅ All frontend services are accessible!');
    console.log('\nNext steps:');
    console.log('1. Open each service in your browser:');
    services.forEach(s => {
      console.log(`   - ${s.name}: http://localhost:${s.port}${s.path}`);
    });
    console.log('\n2. Verify that UI components from @zamio/ui-theme render correctly');
    console.log('3. Check browser console for any import errors');
  } else {
    console.log('\n⚠️  Some services are not accessible. Please check the logs.');
    process.exit(1);
  }
}

runTests().catch(console.error);

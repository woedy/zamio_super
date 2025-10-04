/**
 * Verification script to test shared package imports across all frontend applications
 * This script checks if the shared package test pages are accessible and logs any errors
 */

const http = require('http');

const services = [
  { name: 'zamio_frontend', port: 9002, path: '/shared-package-test' },
  { name: 'zamio_admin', port: 9007, path: '/shared-package-test' },
  { name: 'zamio_publisher', port: 9006, path: '/shared-package-test' },
  { name: 'zamio_stations', port: 9005, path: '/shared-package-test' }
];

function checkService(service) {
  return new Promise((resolve) => {
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
        const success = res.statusCode === 200;
        resolve({
          service: service.name,
          port: service.port,
          status: res.statusCode,
          success: success,
          accessible: true
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        service: service.name,
        port: service.port,
        error: error.message,
        success: false,
        accessible: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        service: service.name,
        port: service.port,
        error: 'Request timeout',
        success: false,
        accessible: false
      });
    });

    req.end();
  });
}

async function verifyAllServices() {
  console.log('🔍 Verifying shared package imports across all frontend services...\n');
  
  const results = await Promise.all(services.map(checkService));
  
  console.log('Results:\n');
  console.log('═'.repeat(80));
  
  let allSuccess = true;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.service.padEnd(20)} | Port: ${result.port} | Status: ${result.status || 'N/A'}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (!result.success) {
      allSuccess = false;
    }
  });
  
  console.log('═'.repeat(80));
  console.log('\n📊 Summary:');
  console.log(`   Total services: ${results.length}`);
  console.log(`   Accessible: ${results.filter(r => r.accessible).length}`);
  console.log(`   Success: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);
  
  if (allSuccess) {
    console.log('\n✅ All frontend services are accessible and serving the shared package test page!');
    console.log('\n📝 Manual verification steps:');
    console.log('   1. Open http://localhost:9002/shared-package-test (zamio_frontend)');
    console.log('   2. Open http://localhost:9007/shared-package-test (zamio_admin)');
    console.log('   3. Open http://localhost:9006/shared-package-test (zamio_publisher)');
    console.log('   4. Open http://localhost:9005/shared-package-test (zamio_stations)');
    console.log('   5. Verify all UI components render correctly');
    console.log('   6. Check browser console for any import errors');
  } else {
    console.log('\n❌ Some services are not accessible. Please check the logs.');
    process.exit(1);
  }
}

verifyAllServices().catch(console.error);

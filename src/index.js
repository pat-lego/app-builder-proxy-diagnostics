#!/usr/bin/env node

import { getProxyForUrl } from 'proxy-from-env';
import testConfigs from '../tests.json' with { type: 'json' }; 

/**
 * Main diagnostic function
 */
async function runDiagnostics({ verbose = false }) {
  console.log('🚀 Starting Proxy Network Connection Diagnostics\n');
  
  // Get proxy URLs from environment variables
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;

  console.log('📋 Environment Variables:');
  console.log(`   HTTPS_PROXY: ${httpsProxy || 'not set'}`);
  console.log(`   HTTP_PROXY: ${httpProxy || 'not set'}`);
  console.log(`   NO_PROXY: ${noProxy || 'not set'}`);
  
    // Run all connection tests
  console.log('\n🧪 Running Connection Tests...');
  
  const results = [];

  // first item is metadata, we remove it
const metadata = testConfigs.shift();

  for (const config of testConfigs) {
    const testFunction = (await import(`./${config.test}.js`)).default;
    const useProxy = config.args.proxyUrl !== false;

    let proxyUrl = getProxyForUrl(config.args.testEndpoint)
    if (!proxyUrl && useProxy) {
      console.log(`💥 No proxy found for the test endpoint ${config.args.testEndpoint}. Exiting with error.`);
      console.log('Please check your proxy configuration and ensure the proxy servers are set as env vars.');
      process.exit(1);
    }

    const options = {
      ...config.args,
      proxyUrl: useProxy ? proxyUrl : undefined,
      verbose
    }
    if (!metadata.ignore?.includes(config.name)) {
      const result = await testFunction(options);
      results.push(result);
      if (result.success) {
        console.log(`✅ Test "${config.name}" is successful.`);
      } else {
        console.log(`❌ Test "${config.name}" failed.`);
      }
    } else {
      console.log(`⛔ Test "${config.name}" is disabled`);
    }
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const proxy = result.proxy === 'none' ? 'Direct' : result.proxy;
    console.log(`${status} ${result.method}`);
    console.log(`   Proxy: ${proxy}`);
    if (result.success) {
      console.log(`   Status: ${result.status}`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
    console.log(`   Endpoint: ${result.endpoint}`);
    console.log('');
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`📈 Overall Success Rate: ${successCount}/${totalCount} (${Math.round((successCount/totalCount)*100)|0}%)`);
  
  if (successCount === totalCount && totalCount === 0) {
    const err = new Error('⚠️  No tests were run. Check your tests.json file.');
    err.testError = true;
    throw err;
  } else if (successCount === totalCount) {
    console.log('🎉 All tests passed! Proxy configuration is working correctly.');
  } else if (successCount > 0) {
    const err = '⚠️  Some tests failed. Check the error messages above.'
    err.testError = true;
    throw err
  } else {
    const err = new Error('💥 All tests failed. Check your proxy configuration and network connectivity.');
    err.testError = true;
    throw err;
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const verbose = process.argv.includes('--verbose');
  
  runDiagnostics({ verbose}).catch(error => {
    if (error.testError) {
      if (verbose) {
        console.log(error);
      } else {
        console.log(error.message);
      }
    } else {
      console.error('💥 Fatal error:', error);
    }
    process.exit(1);
  });
}

export {
  runDiagnostics
};

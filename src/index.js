#!/usr/bin/env node

import { testWithAioLibCoreNetworking } from './test-aio-lib-core-networking.js';
import { testWithAioLibRuntime } from './test-aio-lib-runtime.js';
import { testWithFetch } from './test-fetch-proxy.js';
import { testWithNeedle } from './test-needle-proxy.js';
import { PROXY_TEST_ENDPOINT, RUNTIME_API_HOST } from './constants.js';
import { getProxyForUrl } from 'proxy-from-env';

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('🚀 Starting Proxy Network Connection Diagnostics\n');
  
  // Get proxy URLs from environment variables
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;

  console.log('📋 Environment Variables:');
  console.log(`   HTTPS_PROXY: ${httpsProxy || 'not set'}`);
  console.log(`   HTTP_PROXY: ${httpProxy || 'not set'}`);
  console.log(`   NO_PROXY: ${noProxy || 'not set'}`);
  
  const proxyUrl = getProxyForUrl(PROXY_TEST_ENDPOINT);
  if (!proxyUrl) {
    console.log('💥 No proxy found for the test endpoint ${PROXY_TEST_ENDPOINT}. Exiting with error.');
    console.log('Please check your proxy configuration and ensure the proxy servers are set as env vars.');
    process.exit(1);
  }

  // Run all connection tests
  console.log('\n🧪 Running Connection Tests...');
  console.log(`   Test endpoint: ${PROXY_TEST_ENDPOINT}`);
  
  const results = [];

  // Test with fetch (no proxy)
  results.push(await testWithFetch(null));

  // Test with @adobe/aio-lib-core-networking
  results.push(await testWithAioLibCoreNetworking());
  
  // Test with @adobe/aio-lib-runtime
  results.push(await testWithAioLibRuntime(RUNTIME_API_HOST));

  // Test with fetch + proxy agents
  results.push(await testWithFetch(proxyUrl));
  
  // Test with needle + proxy agents
  results.push(await testWithNeedle(proxyUrl));
  
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
  
  console.log(`📈 Overall Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 All tests passed! Proxy configuration is working correctly.');
  } else if (successCount > 0) {
    console.log('⚠️  Some tests failed. Check the error messages above.');
  } else {
    console.log('💥 All tests failed. Check your proxy configuration and network connectivity.');
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

export {
  runDiagnostics
};

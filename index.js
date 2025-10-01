#!/usr/bin/env node

const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');
const needle = require('needle');
const { HttpExponentialBackoff, createFetch } = require('@adobe/aio-lib-core-networking');

// Configuration
const TEST_ENDPOINT = 'https://httpbin.org/get';
const TIMEOUT = 10000; // 10 seconds

/**
 * Check if a proxy server is reachable
 * @param {string} proxyUrl - The proxy URL to test
 * @returns {Promise<boolean>} - Whether the proxy is reachable
 */
async function checkProxyReachability(proxyUrl) {
  if (!proxyUrl) return false;
  
  try {
    console.log(`🔍 Checking proxy reachability: ${proxyUrl}`);
    
    // Try to connect to the proxy server with a simple HTTP request
    const agent = new HttpProxyAgent(proxyUrl);
    const response = await fetch('http://httpbin.org/get', {
      agent,
      signal: AbortSignal.timeout(TIMEOUT)
    });
    
    if (response.ok) {
      console.log(`✅ Proxy ${proxyUrl} is reachable`);
      return true;
    } else {
      console.log(`❌ Proxy ${proxyUrl} returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Proxy ${proxyUrl} is not reachable: ${error.message}`);
    return false;
  }
}

/**
 * Test connection using @adobe/aio-lib-core-networking
 * @param {string} httpsProxy - HTTPS proxy URL
 * @param {string} httpProxy - HTTP proxy URL
 * @returns {Promise<Object>} - Test result
 */
async function testWithAioNetworking(httpsProxy, httpProxy) {
  console.log('\n📦 Testing with @adobe/aio-lib-core-networking...');
  
  try {
    const options = {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': '@adobe/app-builder-proxy-diagnostics/1.0.0'
      }
    };

    // Use HTTPS proxy for HTTPS requests
    if (httpsProxy) {
      options.agent = new HttpsProxyAgent(httpsProxy);
    }

    // Use createFetch to create a fetch function that respects proxy settings
    const proxyFetch = createFetch();
    const response = await proxyFetch(TEST_ENDPOINT, options);
    
    if (response.ok) {
      console.log('✅ @adobe/aio-lib-core-networking: Connection successful');
      return {
        success: true,
        method: '@adobe/aio-lib-core-networking',
        status: response.status,
        proxy: httpsProxy || 'none',
        responseTime: Date.now()
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ @adobe/aio-lib-core-networking: ${error.message}`);
    return {
      success: false,
      method: '@adobe/aio-lib-core-networking',
      error: error.message,
      proxy: httpsProxy || 'none'
    };
  }
}

/**
 * Test connection using fetch with proxy agents
 * @param {string} httpsProxy - HTTPS proxy URL
 * @param {string} httpProxy - HTTP proxy URL
 * @returns {Promise<Object>} - Test result
 */
async function testWithFetch(httpsProxy, httpProxy) {
  console.log('\n🌐 Testing with fetch + proxy agents...');
  
  try {
    const options = {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': '@adobe/app-builder-proxy-diagnostics/1.0.0'
      }
    };

    // Use HTTPS proxy for HTTPS requests
    if (httpsProxy) {
      options.agent = new HttpsProxyAgent(httpsProxy);
    }

    const response = await fetch(TEST_ENDPOINT, options);
    
    if (response.ok) {
      console.log('✅ fetch + proxy agents: Connection successful');
      return {
        success: true,
        method: 'fetch + proxy agents',
        status: response.status,
        proxy: httpsProxy || 'none',
        responseTime: Date.now()
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ fetch + proxy agents: ${error.message}`);
    return {
      success: false,
      method: 'fetch + proxy agents',
      error: error.message,
      proxy: httpsProxy || 'none'
    };
  }
}

/**
 * Test connection using needle with proxy agents
 * @param {string} httpsProxy - HTTPS proxy URL
 * @param {string} httpProxy - HTTP proxy URL
 * @returns {Promise<Object>} - Test result
 */
async function testWithNeedle(httpsProxy, httpProxy) {
  console.log('\n📌 Testing with needle + proxy agents...');
  
  return new Promise((resolve) => {
    const options = {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': '@adobe/app-builder-proxy-diagnostics/1.0.0'
      }
    };

    // Use HTTPS proxy for HTTPS requests
    if (httpsProxy) {
      options.agent = new HttpsProxyAgent(httpsProxy);
    }

    needle.get(TEST_ENDPOINT, options, (error, response) => {
      if (error) {
        console.log(`❌ needle + proxy agents: ${error.message}`);
        resolve({
          success: false,
          method: 'needle + proxy agents',
          error: error.message,
          proxy: httpsProxy || 'none'
        });
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log('✅ needle + proxy agents: Connection successful');
        resolve({
          success: true,
          method: 'needle + proxy agents',
          status: response.statusCode,
          proxy: httpsProxy || 'none',
          responseTime: Date.now()
        });
      } else {
        console.log(`❌ needle + proxy agents: HTTP ${response.statusCode}`);
        resolve({
          success: false,
          method: 'needle + proxy agents',
          error: `HTTP ${response.statusCode}`,
          proxy: httpsProxy || 'none'
        });
      }
    });
  });
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('🚀 Starting Proxy Network Connection Diagnostics\n');
  
  // Get proxy URLs from environment variables
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  
  console.log('📋 Environment Variables:');
  console.log(`   HTTPS_PROXY: ${httpsProxy || 'not set'}`);
  console.log(`   HTTP_PROXY: ${httpProxy || 'not set'}`);
  
  // Check proxy reachability first
  console.log('\n🔍 Checking Proxy Reachability...');
  const httpsProxyReachable = await checkProxyReachability(httpsProxy);
  const httpProxyReachable = await checkProxyReachability(httpProxy);
  
  if (!httpsProxyReachable && !httpProxyReachable) {
    console.log('\n💥 No reachable proxies found. Exiting with error.');
    console.log('Please check your proxy configuration and ensure the proxy servers are accessible.');
    process.exit(1);
  }
  
  // Run all connection tests
  console.log('\n🧪 Running Connection Tests...');
  console.log(`   Test endpoint: ${TEST_ENDPOINT}`);
  
  const results = [];
  
  // Test with @adobe/aio-lib-core-networking
  results.push(await testWithAioNetworking(httpsProxy, httpProxy));
  
  // Test with fetch + proxy agents
  results.push(await testWithFetch(httpsProxy, httpProxy));
  
  // Test with needle + proxy agents
  results.push(await testWithNeedle(httpsProxy, httpProxy));
  
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
if (require.main === module) {
  runDiagnostics().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runDiagnostics,
  checkProxyReachability,
  testWithAioNetworking,
  testWithFetch,
  testWithNeedle
};

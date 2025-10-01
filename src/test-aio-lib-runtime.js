import runtimeSdk from '@adobe/aio-lib-runtime';
import { PROXY_TEST_ENDPOINT, TIMEOUT, USER_AGENT_BASE, RUNTIME_API_HOST } from './constants.js';

/**
 * Test connection using @adobe/aio-lib-core-networking
 *
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export async function testWithAioLibRuntime(
  testEndpoint, 
  timeout = TIMEOUT, 
  userAgent = `${USER_AGENT_BASE}/aio-lib-runtime`
) {
  console.log('\n🔍 Testing with @adobe/aio-lib-runtime...');
  let sdkClient, errorResponse;
  
  try {
    const options = {
      timeout,
      headers: {
        'User-Agent': userAgent
      }
    };

    // Use createFetch to create a fetch function that respects proxy settings
    sdkClient = await runtimeSdk.init({ 
      apihost: testEndpoint,
      api_key: 'dummy_auth_key',
      namespace: 'dummy_namespace' 
    })

    errorResponse = {
      success: false,
      method: '@adobe/aio-lib-runtime (proxy aware)',
      error: 'not supposed to succeed here',
      proxy: sdkClient.initOptions.proxy || 'none',
      endpoint: RUNTIME_API_HOST
    };

    await sdkClient.packages.list();

    // we expect it NOT to be OK, with a 401 status (exception expected)
    // if it got here below, it means it wasn't successful
    console.log(`❌ @adobe/aio-lib-runtime: not supposed to succeed here`);
    return errorResponse;
  } catch (error) {
    if (error.statusCode !== 401) {
      console.log(`❌ @adobe/aio-lib-runtime: not supposed to succeed here`);
      return errorResponse;
    }
    console.log('✅ @adobe/aio-lib-runtime: Connection successful (401 error expected)');
    return {
      success: true,
      method: '@adobe/aio-lib-runtime (proxy aware)',
      status: `${error.statusCode} (expected)`,
      proxy: sdkClient.initOptions.proxy || 'none',
      responseTime: Date.now(),
      endpoint: RUNTIME_API_HOST
    };
  }
}
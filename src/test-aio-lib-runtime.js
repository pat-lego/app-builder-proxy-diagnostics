import runtimeSdk from '@adobe/aio-lib-runtime';
import { USER_AGENT_BASE, RUNTIME_API_HOST, getProxyAgent } from './constants.js';

/**
 * Test connection using @adobe/aio-lib-core-networking
 *
 * @param {string} testEndpoint - The endpoint to test against
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export default async function testWithAioLibRuntime({
  testEndpoint = RUNTIME_API_HOST, 
  userAgent = `${USER_AGENT_BASE}/aio-lib-runtime`,
  verbose = false
  } = {}) {
  let sdkClient, errorResponse;
  
  try {
    // don't do this in production, it's just for testing
    sdkClient = await runtimeSdk.init({ 
      apihost: testEndpoint,
      api_key: 'dummy_auth_key',
      namespace: 'dummy_namespace'
    })
    // we get the proxy url from the sdk client
    const proxyUrl = sdkClient.initOptions.proxy;
    const agent = getProxyAgent(testEndpoint, proxyUrl);

    // we use the proxy url from the sdk client to initialize the agent
    sdkClient = await runtimeSdk.init({ 
      apihost: testEndpoint,
      api_key: 'dummy_auth_key',
      namespace: 'dummy_namespace',
      agent
    })

    errorResponse = {
      success: false,
      method: '@adobe/aio-lib-runtime (proxy aware)',
      error: 'not supposed to succeed here',
      proxy: proxyUrl || 'none',
      endpoint: testEndpoint
    };

    await sdkClient.packages.list({ 'User-Agent': userAgent });

    // we expect it NOT to be OK, with a 401 status (exception expected)
    // if it got here below, it means it wasn't successful
    return errorResponse;
  } catch (error) {
    if (verbose) {
      console.log(error);
    }
    if (error.statusCode !== 401) {
      return errorResponse;
    }
    return {
      success: true,
      method: '@adobe/aio-lib-runtime (proxy aware)',
      status: `${error.statusCode} (expected)`,
      proxy: sdkClient.initOptions.proxy || 'none',
      responseTime: Date.now(),
      endpoint: testEndpoint
    };
  }
}
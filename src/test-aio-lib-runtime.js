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
  proxyUrl,
  testEndpoint = RUNTIME_API_HOST, 
  userAgent = `${USER_AGENT_BASE}/aio-lib-runtime`,
  verbose = false
  } = {}) {
  let sdkClient, errorResponse;
  
  try {
    const agent = getProxyAgent(testEndpoint, proxyUrl);
    const use_proxy_from_env_var = false;
  
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
    
    // patch needed in https://github.com/apache/openwhisk-client-js/blob/6cbfef14cc05b6df5e55d6eb8354c9a43da2f247/lib/client.js#L116-L118
    // but we monkey-patch it here
    if (use_proxy_from_env_var === false) {
      sdkClient.actions.client.options.proxy = undefined; 
    }
    // monkeypatch client.params https://github.com/apache/openwhisk-client-js/blob/6cbfef14cc05b6df5e55d6eb8354c9a43da2f247/lib/client.js#L184
    // patch one, all the rest should be patched (shared client)
    sdkClient.actions.client._originalParams = sdkClient.actions.client.params;
    sdkClient.actions.client.params = function(method, path, options) {
      return this._originalParams(method, path, options).then(params => {
        params.use_proxy_from_env_var = false;
        return params;
      });
    };

    await sdkClient.packages.list();

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
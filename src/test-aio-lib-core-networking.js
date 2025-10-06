import { createFetch } from '@adobe/aio-lib-core-networking';
import { TIMEOUT, USER_AGENT_BASE } from './constants.js';
import { getProxyForUrl } from 'proxy-from-env';

/**
 * Test connection using @adobe/aio-lib-core-networking
 *
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export default async function testWithAioLibCoreNetworking({
  testEndpoint, 
  timeout = TIMEOUT, 
  userAgent = `${USER_AGENT_BASE}/aio-lib-core-networking`
  } = {}) {
  try {
    const options = {
      timeout,
      headers: {
        'User-Agent': userAgent
      }
    };

    // we find out what proxyUrl is being used by the library (same function is used by the library itself)
    const proxyUrl = getProxyForUrl(testEndpoint);

    // Use createFetch to create a fetch function that respects proxy settings
    const proxyFetch = createFetch();
    const response = await proxyFetch(testEndpoint, options);
    
    if (response.ok) {
      return {
        success: true,
        method: '@adobe/aio-lib-core-networking (proxy aware)',
        status: response.status,
        proxy: proxyUrl || 'none',
        responseTime: Date.now(),
        endpoint: testEndpoint
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    return {
      success: false,
      method: '@adobe/aio-lib-core-networking (proxy aware)',
      error: error.message,
      proxy: proxyUrl || 'none',
      endpoint: testEndpoint
    };
  }
}

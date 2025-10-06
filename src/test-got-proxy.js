import { TIMEOUT, USER_AGENT_BASE, getHpProxyAgent } from './constants.js';
import got from 'got';

/**
 * Test connection using got with proxy agents
 *
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export default async function testWithGot({
  proxyUrl,
  testEndpoint,
  timeout = TIMEOUT,
  userAgent = `${USER_AGENT_BASE}/got-proxy-agent`,
  verbose = false
} = {}) {
  try {
    const options = {
      method: 'GET',
      timeout: {
        request: timeout
      },
      headers: {
        'User-Agent': userAgent
      }
    };

    if (proxyUrl) {
      options.agent = { 
        http: getHpProxyAgent(testEndpoint, proxyUrl),
        https: getHpProxyAgent(testEndpoint, proxyUrl) 
      };
    }

    const response = await got(testEndpoint, options);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {
        success: true,
        method: proxyUrl ? 'got + proxy agents' : 'got (no proxy)',
        status: response.statusCode,
        proxy: proxyUrl || 'none',
        responseTime: Date.now(),
        endpoint: testEndpoint
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    if (verbose) {
      console.log(error);
    }
    return {
      success: false,
      method: proxyUrl ? 'got + proxy agents' : 'got (no proxy)',
      error: error.message,
      proxy: proxyUrl || 'none',
      endpoint: testEndpoint
    };
  }
}

import { TIMEOUT, USER_AGENT_BASE, getProxyAgent } from './constants.js';
import { fetch, ProxyAgent } from 'undici'

/**
 * Test connection using fetch with proxy agents
 *
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export default async function testWithFetch({
  proxyUrl,
  testEndpoint,
  timeout = TIMEOUT,
  userAgent = `${USER_AGENT_BASE}/fetch-proxy-agent`
} = {}) {
  try {
    const options = {
      timeout: timeout,
      headers: {
        'User-Agent': userAgent
      }
    };

    if (proxyUrl) {
      const agent = new ProxyAgent(proxyUrl)
      options.dispatcher = agent
    }

    const response = await fetch(testEndpoint, options);
    
    if (response.ok) {
      return {
        success: true,
        method: proxyUrl ? 'fetch + proxy agents' : 'fetch (no proxy)',
        status: response.status,
        proxy: proxyUrl || 'none',
        responseTime: Date.now(),
        endpoint: testEndpoint
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log('XXXXXerror', error);
    return {
      success: false,
      method: proxyUrl ? 'fetch + proxy agents' : 'fetch (no proxy)',
      error: error.message,
      proxy: proxyUrl || 'none',
      endpoint: testEndpoint
    };
  }
}

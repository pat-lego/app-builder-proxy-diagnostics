import needle from 'needle';
import { TIMEOUT, USER_AGENT_BASE, getProxyAgent, getHpProxyAgent } from './constants.js';

/**
 * Test connection using needle with proxy agents
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export default async function testWithNeedle({
  proxyUrl,
  testEndpoint,
  timeout = TIMEOUT,
  userAgent = `${USER_AGENT_BASE}/needle-proxy-agent`
} = {}) {
  return new Promise((resolve) => {
    const options = {
      timeout: timeout,
      headers: {
        'User-Agent': userAgent
      }
    };

    options.proxy = proxyUrl;
    options.agent = getProxyAgent(testEndpoint, proxyUrl);

    needle.get(testEndpoint, options, (error, response) => {
      if (error) {
        resolve({
          success: false,
          method: 'needle + proxy agents',
          error: error.message,
          proxy: proxyUrl || 'none'
        });
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve({
          success: true,
          method: 'needle + proxy agents',
          status: response.statusCode,
          proxy: proxyUrl || 'none',
          responseTime: Date.now(),
          endpoint: testEndpoint
        });
      } else {
        resolve({
          success: false,
          method: 'needle + proxy agents',
          error: `HTTP ${response.statusCode} ${response.statusMessage}`,
          proxy: proxyUrl || 'none',
          endpoint: testEndpoint
        });
      }
    });
  });
}

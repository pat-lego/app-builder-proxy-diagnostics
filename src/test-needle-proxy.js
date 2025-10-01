import needle from 'needle';
import { PROXY_TEST_ENDPOINT, TIMEOUT, USER_AGENT_BASE, getProxyAgent } from './constants.js';

/**
 * Test connection using needle with proxy agents
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export async function testWithNeedle(
  proxyUrl,
  testEndpoint = PROXY_TEST_ENDPOINT,
  timeout = TIMEOUT,
  userAgent = `${USER_AGENT_BASE}/needle-proxy-agent`
) {
  console.log('\n🔍 Testing with needle + proxy agents...');
  
  return new Promise((resolve) => {
    const options = {
      timeout: timeout,
      headers: {
        'User-Agent': userAgent
      }
    };

    options.agent = getProxyAgent(testEndpoint, proxyUrl);

    needle.get(testEndpoint, options, (error, response) => {
      if (error) {
        console.log(`❌ needle + proxy agents: ${error.message}`);
        resolve({
          success: false,
          method: 'needle + proxy agents',
          error: error.message,
          proxy: proxyUrl || 'none'
        });
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log('✅ needle + proxy agents: Connection successful');
        resolve({
          success: true,
          method: 'needle + proxy agents',
          status: response.statusCode,
          proxy: proxyUrl || 'none',
          responseTime: Date.now(),
          endpoint: testEndpoint
        });
      } else {
        console.log(`❌ needle + proxy agents: HTTP ${response.statusCode}`);
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

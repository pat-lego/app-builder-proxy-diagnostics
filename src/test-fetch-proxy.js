import { PROXY_TEST_ENDPOINT, TIMEOUT, USER_AGENT_BASE, getProxyAgent } from './constants.js';

/**
 * Test connection using fetch with proxy agents
 *
 * @param {string} proxyUrl - Proxy URL to use
 * @param {string} testEndpoint - The endpoint to test against
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} - Test result
 */
export async function testWithFetch(
  proxyUrl,
  testEndpoint = PROXY_TEST_ENDPOINT,
  timeout = TIMEOUT,
  userAgent = `${USER_AGENT_BASE}/fetch-proxy-agent`
) {
  console.log('\n🔍 Testing with fetch + proxy agents...');
  
  try {
    const options = {
      timeout: timeout,
      headers: {
        'User-Agent': userAgent
      }
    };

    if (proxyUrl) {
      options.agent = getProxyAgent(testEndpoint, proxyUrl);
    }

    const response = await fetch(testEndpoint, options);
    
    if (response.ok) {
      console.log('✅ fetch + proxy agents: Connection successful');
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
    console.log(`❌ fetch + proxy agents: ${error.message}`);
    return {
      success: false,
      method: proxyUrl ? 'fetch + proxy agents' : 'fetch (no proxy)',
      error: error.message,
      proxy: proxyUrl || 'none',
      endpoint: testEndpoint
    };
  }
}

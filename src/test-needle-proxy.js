import needle from 'needle';
import { TIMEOUT, USER_AGENT_BASE, getProxyAgent } from './constants.js';

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
  userAgent = `${USER_AGENT_BASE}/needle-proxy-agent`,
  verbose = false
} = {}) {
  return new Promise(async (resolve) => { 
    const proxyUrlParts = new URL(proxyUrl);
    const proxyOptions = {
      proxy: {
        host: proxyUrlParts.hostname,
        port: proxyUrlParts.port || (proxyUrlParts.protocol === 'https:' ? 443 : 80),
        protocol: proxyUrlParts.protocol
      }
    }
    const agent = getProxyAgent(testEndpoint, proxyUrl);

    const options = {
      timeout,
      headers: {
        'User-Agent': userAgent
      },
      agent,
      url: testEndpoint
    };

    const method = 'needle + proxy agents';
    const endpoint = testEndpoint;
    const proxy = proxyUrl || 'none';

    needle.get(testEndpoint, options, function(err, resp) {
      if (err) {
        if (verbose) {
          console.log(err);
          console.error('error',err.message)
        }
      } else {
        if (verbose) {
          console.log('resp?.body', resp?.body); 
        }
      }

      resolve({
        success: !err,
        method,
        status: !err ? 200 : 500,
        proxy,
        responseTime: Date.now(),
        endpoint
      });
    });
  });
}

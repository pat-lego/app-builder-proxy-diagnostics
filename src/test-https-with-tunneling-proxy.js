import { USER_AGENT_BASE } from './constants.js';
import { httpsOverHttp } from 'tunnel-agent';
import https from 'node:https';

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
  userAgent = `${USER_AGENT_BASE}/needle-proxy-agent`,
  verbose = false
} = {}) {
  return new Promise(async (resolve) => {
    const proxyUrlParts = new URL(proxyUrl);
    const proxyOptions = {
      proxy: {
        host: proxyUrlParts.hostname,
        port: proxyUrlParts.port || (proxyUrlParts.protocol === 'https:' ? 443 : 80)
      }
    }
    const tunnelingAgent = httpsOverHttp(proxyOptions);

    const method = 'https.request with tunneling proxy';
    const endpoint = testEndpoint;
    const proxy = proxyUrl || 'none';
    const reqUrl = new URL(testEndpoint);
    const reqOptions = {
      host: reqUrl.hostname,
      port: reqUrl.port || (reqUrl.protocol === 'https:' ? 443 : 80),
      path: reqUrl.pathname,
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      },
      agent: tunnelingAgent
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
    
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      res.on('end', () => {
        // console.log('Response Body:', JSON.parse(data));
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            success: true,
            method,
            status: res.statusCode,
            proxy,
            responseTime: Date.now(),
            endpoint
          });
        } else {
          resolve({
            success: false,
            method,
            error: `HTTP ${res.statusCode} ${res.statusMessage}`,
            proxy,
            responseTime: Date.now(),
            status: res.statusCode,
            endpoint
          });
        }  
      });
    });
    
    req.on('error', (error) => {
      if (verbose) {
        console.log(error);
      }
      console.error(`Problem with request: ${e.message}`);
      resolve({
        success: false,
        method,
        error: error.message,
        proxy,
        status: 'unknown',
        endpoint
      });
    });
    
    req.end();
  });
}

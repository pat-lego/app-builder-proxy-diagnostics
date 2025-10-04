import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import PatchedHttpsProxyAgent from './PatchedHttpsProxyAgent.js';

// Configuration constants
export const PROXY_TEST_ENDPOINT = 'https://deploy-service.app-builder.adp.adobe.io/ping';
export const RUNTIME_API_HOST = 'https://deploy-service.app-builder.adp.adobe.io/runtime';
export const TIMEOUT = 30000; // 30 seconds
export const USER_AGENT_VERSION = process.env.npm_package_version || '1.0.x';
export const USER_AGENT_BASE = `@adobe/app-builder-proxy-diagnostics/${USER_AGENT_VERSION}`;

/**
 * Get the proxy agent for the given endpoint
 *
 * @param {string} endpoint - The endpoint to get the proxy agent for
 * @param {string} proxyUrl - The proxy URL to use
 * @param {Object} proxyOptions - The proxy options to use
 * @returns {HttpsProxyAgent | HttpProxyAgent} - The proxy agent
 */
export function getProxyAgent(endpoint, proxyUrl, proxyOptions = {}) {
    if (endpoint.startsWith('https')) {
        return new PatchedHttpsProxyAgent(proxyUrl, proxyOptions);
    } else {
        return new HttpProxyAgent(proxyUrl, proxyOptions);
    }
}

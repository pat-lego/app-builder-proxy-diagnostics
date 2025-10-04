import { HttpsProxyAgent } from 'https-proxy-agent';

/**
 * HttpsProxyAgent needs a patch for TLS connections.
 * It doesn't pass in the original options during a SSL connect.
 *
 * See https://github.com/TooTallNate/proxy-agents/issues/89
 * An alternative is to use https://github.com/delvedor/hpagent
 * @private
 */
export default class PatchedHttpsProxyAgent extends HttpsProxyAgent {
    constructor (proxyUrl, opts) {
      super(proxyUrl, opts)
      this.savedOpts = opts
    }
  
    async connect (req, opts) {
      return super.connect(req, { ...this.savedOpts, ...opts })
    }
}
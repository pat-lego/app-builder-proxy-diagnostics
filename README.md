# App Builder Proxy Diagnostics

A comprehensive tool to diagnose proxy network connections for Adobe App Builder applications. This tool tests proxy connectivity using multiple methods to help identify and resolve network configuration issues.

## Features

- **Proxy Reachability Check**: Verifies if proxy servers are accessible before running tests
- **Multiple Connection Methods**: Tests connectivity using three different approaches:
  1. `@adobe/aio-lib-core-networking` package
  2. `fetch` with `https-proxy-agent`/`http-proxy-agent` packages
  3. `needle` with `https-proxy-agent`/`http-proxy-agent` packages
- **Comprehensive Reporting**: Detailed test results with success/failure status
- **Environment Variable Support**: Uses `HTTPS_PROXY` and `HTTP_PROXY` environment variables

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Basic Usage

Run the diagnostic tool:
```bash
npm start
# or
node index.js
```

### With Proxy Environment Variables

Set your proxy environment variables and run:
```bash
export HTTPS_PROXY=http://proxy.company.com:8080
export HTTP_PROXY=http://proxy.company.com:8080
npm start
```

### Programmatic Usage

You can also use the tool programmatically:

```javascript
const { runDiagnostics, checkProxyReachability } = require('./index.js');

// Run full diagnostics
await runDiagnostics();

// Check specific proxy reachability
const isReachable = await checkProxyReachability('http://proxy.company.com:8080');
```

## Environment Variables

The tool reads the following environment variables:

- `HTTPS_PROXY` or `https_proxy`: HTTPS proxy URL (e.g., `http://proxy.company.com:8080`)
- `HTTP_PROXY` or `http_proxy`: HTTP proxy URL (e.g., `http://proxy.company.com:8080`)

## Test Endpoint

The tool uses `https://httpbin.org/get` as the test endpoint to verify connectivity. This endpoint:
- Returns HTTP 200 on successful requests
- Provides request information in the response
- Is reliable and commonly used for testing

## Output

The tool provides detailed output including:

1. **Environment Variables**: Shows configured proxy settings
2. **Proxy Reachability**: Tests if proxy servers are accessible
3. **Connection Tests**: Results from each connection method
4. **Summary Report**: Overall success rate and recommendations

### Example Output

```
🚀 Starting Proxy Network Connection Diagnostics

📋 Environment Variables:
   HTTPS_PROXY: http://proxy.company.com:8080
   HTTP_PROXY: http://proxy.company.com:8080

🔍 Checking Proxy Reachability...
🔍 Checking proxy reachability: http://proxy.company.com:8080
✅ Proxy http://proxy.company.com:8080 is reachable

🧪 Running Connection Tests...
   Test endpoint: https://httpbin.org/get

📦 Testing with @adobe/aio-lib-core-networking...
✅ @adobe/aio-lib-core-networking: Connection successful

🌐 Testing with fetch + proxy agents...
✅ fetch + proxy agents: Connection successful

📌 Testing with needle + proxy agents...
✅ needle + proxy agents: Connection successful

📊 Test Results Summary:
==================================================
✅ @adobe/aio-lib-core-networking
   Proxy: http://proxy.company.com:8080
   Status: 200

✅ fetch + proxy agents
   Proxy: http://proxy.company.com:8080
   Status: 200

✅ needle + proxy agents
   Proxy: http://proxy.company.com:8080
   Status: 200

📈 Overall Success Rate: 3/3 (100%)
🎉 All tests passed! Proxy configuration is working correctly.
```

## Troubleshooting

### Common Issues

1. **All tests fail**: Check if your proxy server is reachable and credentials are correct
2. **Some tests fail**: Different libraries may handle proxies differently; check specific error messages
3. **Proxy not reachable**: Verify proxy URL format and network connectivity

### Proxy URL Format

Ensure your proxy URLs follow the correct format:
- HTTP: `http://username:password@proxy.company.com:8080`
- HTTPS: `https://username:password@proxy.company.com:8080`

## Dependencies

- `@adobe/aio-lib-core-networking`: Adobe's networking library
- `https-proxy-agent`: HTTPS proxy agent for Node.js
- `http-proxy-agent`: HTTP proxy agent for Node.js
- `needle`: HTTP client for Node.js

## License

ISC

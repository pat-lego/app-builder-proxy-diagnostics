# App Builder Proxy Diagnostics

A comprehensive tool to diagnose proxy network connections for Adobe App Builder applications. This tool tests proxy connectivity using multiple methods to help identify and resolve network configuration issues.

## Features

- **Multiple Connection Methods**: Tests connectivity using four different approaches:
  1. `@adobe/aio-lib-core-networking` package
  2. `@adobe/aio-lib-runtime` package
  3. `fetch` with `https-proxy-agent`/`http-proxy-agent` packages (and no proxy)
  4. `needle` with `https-proxy-agent`/`http-proxy-agent` packages
- **Comprehensive Reporting**: Detailed test results with success/failure status
- **Environment Variable Support**: Uses `HTTPS_PROXY` and `HTTP_PROXY` environment variables

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

**Note**: This project uses ES Modules (ESM). Make sure your Node.js version supports ESM (Node.js 14+ recommended).

## Project Structure

```
├── src/
│   ├── index.js                           # Main diagnostic tool
│   ├── constants.js                       # Configuration constants
│   ├── test-aio-lib-core-networking.js    # @adobe/aio-lib-core-networking test
│   ├── test-aio-lib-runtime.js            # @adobe/aio-lib-runtime test
│   ├── test-fetch-proxy.js                # fetch + proxy agents test
│   └── test-needle-proxy.js               # needle + proxy agents test
├── package.json
└── README.md
```

## Usage

### Basic Usage

Run the diagnostic tool:
```bash
npm start
```

### With Proxy Environment Variables

Set your proxy environment variables and run:
```bash
export HTTPS_PROXY=http://proxy.company.com:8080
export HTTP_PROXY=http://proxy.company.com:8080
npm start
```

## Environment Variables

The tool reads the following environment variables:

- `HTTPS_PROXY` or `https_proxy`: HTTPS proxy URL (e.g., `http://proxy.company.com:8080`)
- `HTTP_PROXY` or `http_proxy`: HTTP proxy URL (e.g., `http://proxy.company.com:8080`)

## Output

The tool provides detailed output including:

1. **Environment Variables**: Shows configured proxy settings
2. **Connection Tests**: Results from each connection method
3. **Summary Report**: Overall success rate and recommendations

### Example Output

```
🚀 Starting Proxy Network Connection Diagnostics

📋 Environment Variables:
   HTTPS_PROXY: http://proxy.company.com:8080
   HTTP_PROXY: http://proxy.company.com:8080

🧪 Running Connection Tests...
   Test endpoint: https://httpbin.org/get

📦 Testing with @adobe/aio-lib-core-networking...
✅ @adobe/aio-lib-core-networking: Connection successful

🏃 Testing with @adobe/aio-lib-runtime...
✅ @adobe/aio-lib-runtime: Connection successful

🌐 Testing with fetch + proxy agents...
✅ fetch + proxy agents: Connection successful

🌐 Testing with fetch (no proxy)...
✅ fetch (no proxy): Connection successful

📌 Testing with needle + proxy agents...
✅ needle + proxy agents: Connection successful

📊 Test Results Summary:
==================================================
✅ @adobe/aio-lib-core-networking
   Proxy: http://proxy.company.com:8080
   Status: 200

✅ @adobe/aio-lib-runtime
   Proxy: http://proxy.company.com:8080
   Status: 401 (expected)

✅ fetch + proxy agents
   Proxy: http://proxy.company.com:8080
   Status: 200

✅ fetch (no proxy)
   Proxy: Direct
   Status: 200

✅ needle + proxy agents
   Proxy: http://proxy.company.com:8080
   Status: 200

📈 Overall Success Rate: 5/5 (100%)
🎉 All tests passed! Proxy configuration is working correctly.
```

## Troubleshooting

### Common Issues

1. **All tests fail**: Check if your proxy server is reachable and credentials are correct
2. **Some tests fail**: Different libraries may handle proxies differently; check specific error messages

### Proxy URL Format

Ensure your proxy URLs follow the correct format:
- HTTP: `http://username:password@proxy.company.com:8080`
- HTTPS: `https://username:password@proxy.company.com:8080`

## Dependencies

- `@adobe/aio-lib-core-networking`: Adobe's networking library for HTTP requests
- `@adobe/aio-lib-runtime`: Adobe's runtime library for App Builder applications
- `https-proxy-agent`: HTTPS proxy agent for Node.js
- `http-proxy-agent`: HTTP proxy agent for Node.js
- `needle`: HTTP client for Node.js
- `proxy-from-env`: Utility to extract proxy configuration from environment variables

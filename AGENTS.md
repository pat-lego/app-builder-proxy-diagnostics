Create a tool that will diagnose a proxy network connection. It should use HTTPS_PROXY and HTTP_PROXY environment variables to connect to a proxy. It should connect to an endpoint in three ways:

1. Use npm package @adobe/aio-lib-core-networking to connect
2. Use fetch and https-proxy-agent / http-proxy-agent packages to connect
3. Use needle npm package and https-proxy-agent / http-proxy-agent packages to connect

The servers at the environment variables HTTPS_PROXY and HTTP_PROXY should be checked whether they are reachable at the start first.
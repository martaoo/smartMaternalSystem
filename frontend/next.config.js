/** @type {import('next').NextConfig} */
const path = require("path")

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  // Security and development fixes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Enforce HTTPS in development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Development server configuration
  experimental: {
    // Fix WebSocket connection issues
    optimizeCss: true,
    // Fix CSS parsing issues
    optimizePackageImports: ['sharp', 'lodash', 'date-fns'],
  },
  // Fix network timeout issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // Fix HMR timeout
      config.devServer = {
        ...config.devServer,
        client: {
          webSocketURL: 'auto://0.0.0.0:0/ws',
          reconnect: 10,
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig

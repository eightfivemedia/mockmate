/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  images: { unoptimized: true },
  // pdf-parse reads test files during init when bundled; keep it server-side only
  serverExternalPackages: ['pdf-parse'],
};

module.exports = withSentryConfig(nextConfig, {
  // Suppress Sentry CLI output during builds
  silent: true,
  // Disable source map upload until SENTRY_AUTH_TOKEN is set
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Suppress error on missing auth token
  telemetry: false,
});

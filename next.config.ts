import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  // Provide the path to ./src/i18n/request.ts
  // (This is the default value, but explicit is good)
  './src/i18n/request.ts',
);

const nextConfig: NextConfig = {
  /* config options here */
};

// Wrap the config with the plugin
export default withNextIntl(nextConfig);

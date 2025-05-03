/**
 * @file Next.js configuration file with next-intl plugin integration.
 * @see https://nextjs.org/docs/api-reference/next.config.js
 * @see https://next-intl.dev/docs/getting-started/app-router#add-the-plugin
 */
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Initializes the next-intl plugin.
 * @remarks
 * This plugin handles internationalization routing and message loading.
 * It's configured to use the request handler defined in './src/i18n/request.ts'.
 * @see https://next-intl.dev/docs/getting-started/app-router#add-the-plugin
 */
const withNextIntl = createNextIntlPlugin(
  // Provide the path to ./src/i18n/request.ts
  // (This is the default value, but explicit is good)
  './src/i18n/request.ts',
);

/**
 * Base Next.js configuration object.
 * @remarks
 * This object contains standard Next.js configuration options.
 * Plugins like `withNextIntl` will wrap this base configuration.
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
const nextConfig: NextConfig = {
  /**
   * Configuration for the Next.js Image Optimization API.
   * @see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
   */
  images: {
    /**
     * Defines allowed remote hosts for optimized images using `next/image`.
     * This prevents malicious users from using the Image Optimization API with arbitrary image URLs.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thwbwzkcqdoqhfklggqp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

/**
 * Export the final configuration, wrapped with the next-intl plugin.
 * This ensures that both the base Next.js settings and the internationalization
 * features provided by next-intl are active.
 */
export default withNextIntl(nextConfig);

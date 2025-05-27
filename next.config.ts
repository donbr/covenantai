
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Ensure resolve and alias objects exist
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // Stub out optional OpenTelemetry exporters that @opentelemetry/sdk-node might try to load.
    // This prevents "Module not found" warnings during the build if these aren't installed.
    // These are typically required dynamically based on environment variables,
    // and if not used, they can be safely aliased to false.
    // config.resolve.alias['@opentelemetry/exporter-jaeger'] = false; // Removed as it's now installed
    config.resolve.alias['@opentelemetry/exporter-zipkin'] = false;
    // You could add others here if more warnings appear, e.g.:
    // config.resolve.alias['@opentelemetry/exporter-otlp-grpc'] = false;
    // config.resolve.alias['@opentelemetry/exporter-otlp-http'] = false;

    // The "require.extensions is not supported by webpack" warning from Handlebars
    // is a known issue related to how Handlebars is bundled by Webpack.
    // Since the build completes successfully, it's generally considered benign.
    // A proper fix would likely need to come from the Handlebars library or
    // the way dotprompt/Genkit imports it. For now, we acknowledge it.

    return config;
  },
};

export default nextConfig;

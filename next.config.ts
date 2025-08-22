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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 服务端组件外部包配置
  serverComponentsExternalPackages: [
    'genkit',
    '@genkit-ai/googleai',
    '@genkit-ai/ai',
    '@genkit-ai/core',
    '@google/generative-ai',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    '@opentelemetry/sdk-trace-node',
    'express',
    'get-port'
  ],
  // Webpack 配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端构建时排除服务端模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        http2: false,
        async_hooks: false,
        'fs/promises': false,
      };
    }
    return config;
  },
};

export default nextConfig;

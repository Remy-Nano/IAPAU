import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ⛔ Désactiver ESLint pendant les builds Docker
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⛔ Désactiver les erreurs TypeScript pendant le build prod
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ton ancienne config webpack adaptée
  webpack(config) {
    config.module.rules.push({
      test: /\.csv$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "static/[path][name].[ext]",
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
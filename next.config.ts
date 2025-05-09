import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ajouter la prise en charge des fichiers CSV comme assets statiques
  webpack(config) {
    config.module.rules.push({
      test: /\.csv$/,
      loader: "file-loader",
      options: {
        name: "static/[path][name].[ext]",
      },
    });
    return config;
  },
};

export default nextConfig;

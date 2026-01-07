/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 在构建时进行严格的类型检查
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

module.exports = nextConfig;

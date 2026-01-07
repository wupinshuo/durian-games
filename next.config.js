/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 在构建时进行严格的类型检查
    ignoreBuildErrors: false,
  },
  eslint: {
    // 在构建时进行 ESLint 检查
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ESLint ko build ke time skip karo, dev time pe chalega
  },
  typescript: {
    // TypeScript errors ko warn ke roop mein treat karo (optional)
    tsconfigPath: './tsconfig.json',
  },
  // Caching improve karo
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
};

export default nextConfig;

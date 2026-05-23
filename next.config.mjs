/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath: "/allensnow-com-web",
    // assetPrefix: "/allensnow-com-web/",
    output: process.env.NODE_ENV === "production" ? "export" : undefined,
    reactStrictMode: true,
    images: {
      unoptimized: true
    }
  };
  
  export default nextConfig;
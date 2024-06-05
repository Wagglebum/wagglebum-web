/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath: "/allensnow-com-web",
    // assetPrefix: "/allensnow-com-web/",
    output: "export",  // <=== enables static exports
    reactStrictMode: true,
    images: {
      unoptimized: true
    }
  };
  
  export default nextConfig;
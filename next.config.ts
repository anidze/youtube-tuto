import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images :{
    remotePatterns:[
      {
        hostname: 'encrypted-tbn0.gstatic.com',
        protocol: 'https',
        port: '',
      }
    ]
  }
};

export default nextConfig;

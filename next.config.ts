import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
  
    if (isServer) {
   
      config.externals = config.externals || [];
      config.externals.push('@ffmpeg-installer/ffmpeg');
    }

    return config;
  },

};

export default nextConfig;

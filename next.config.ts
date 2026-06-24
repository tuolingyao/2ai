import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'www.notion.com' },
      { protocol: 'https', hostname: 'uranus-static.oss-accelerate.aliyuncs.com' },
      { protocol: 'https', hostname: 'static.grammarly.com' },
      { protocol: 'https', hostname: 'consensus.app' },
      { protocol: 'https', hostname: 'framerusercontent.com' },
      { protocol: 'https', hostname: 'copilot.microsoft.com' },
      { protocol: 'https', hostname: 'personal-act.wpscdn.cn' },
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'cursor.com' },
      { protocol: 'https', hostname: 'images.ctfassets.net' },
      { protocol: 'https', hostname: 'content-management-files.canva.com' },
      { protocol: 'https', hostname: 's.krea.ai' },
      { protocol: 'https', hostname: 'runwayml.com' },
      { protocol: 'https', hostname: 'cdn.builder.io' },
      { protocol: 'https', hostname: 'elevenlabs.io' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'tana.inc' },
      { protocol: 'https', hostname: 'readwise-assets.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'p9-arcosite.byteimg.com' },
    ],
  },
};

export default nextConfig;

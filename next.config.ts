import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 修复多 lockfile 警告：明确指定 turbopack 根目录
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

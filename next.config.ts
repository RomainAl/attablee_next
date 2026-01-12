import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["192.168.0.42", "192.168.10.2", "*.attablee.art"],
};

export default nextConfig;

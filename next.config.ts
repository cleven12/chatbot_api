import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only env vars are read at runtime; never prefix secrets with NEXT_PUBLIC_
  reactStrictMode: true,
};

export default nextConfig;

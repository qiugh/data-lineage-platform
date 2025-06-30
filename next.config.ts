import type { NextConfig } from "next";

const repo = 'data-lineage-platform';
const assetPrefix = `/${repo}/`;
const basePath = `/${repo}`;

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: assetPrefix,
  basePath: basePath,
};

export default nextConfig;
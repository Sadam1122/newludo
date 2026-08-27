import type { NextConfig } from "next";

const configuredUploadRequestMb = Number(
  process.env.MAX_GALLERY_UPLOAD_REQUEST_MB,
);
const uploadRequestMb =
  Number.isFinite(configuredUploadRequestMb) && configuredUploadRequestMb > 0
    ? configuredUploadRequestMb
    : 60;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: `${uploadRequestMb}mb`,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

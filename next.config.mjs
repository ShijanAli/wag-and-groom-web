import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  images: {
    // uploads are served by Cloudinary (backend /uploads → secure_url)
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;

import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  images: {
    // uploads are served by Cloudinary (backend /uploads → secure_url)
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // seed/dev data may store absolute local URLs (e.g. http://localhost:3000/images/...)
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;

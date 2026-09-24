import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Quiz görselleri Supabase Storage'daki herkese açık depodan gelir.
    remotePatterns: [new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/quiz-media/**`)],
  },
};

export default nextConfig;

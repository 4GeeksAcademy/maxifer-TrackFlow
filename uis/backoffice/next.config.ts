import type {
  NextConfig
} from "next";


const nextConfig: NextConfig = {
  // Embeddings and generation can together exceed the default 30-second proxy limit.
  experimental: {
    proxyTimeout: 120_000,
  },

  async rewrites() {

    return [

      {
        source:
          "/backend/:path*",

        destination:
          (
            (process.env.BACKEND_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
            + "/:path*"
          ),
      },

    ];

  },

};


export default nextConfig;

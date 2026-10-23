import type {
  NextConfig
} from "next";


const nextConfig: NextConfig = {

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

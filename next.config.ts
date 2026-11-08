import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "covers.openlibrary.org"
            },
            {
                protocol: "https",
                hostname: "4ghqjsed.us-east.insforge.app"
            },
        ]
    }
};

export default nextConfig;

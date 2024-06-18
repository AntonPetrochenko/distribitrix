/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig: {
        NEXT_PUBLIC_GATEWAY_URL: process.env.GATEWAY_URL,
    },
    publicRuntimeConfig: {
        NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    }
};

export default nextConfig;

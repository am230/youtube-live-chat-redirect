/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    reactStrictMode: false,
    swcMinify: true,
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                hostname: 'twitcasting.tv',
                pathname: '/**'
            },
            {
                hostname: '*.twitcasting.tv',
                pathname: '/**'
            }
        ]
    },

    async rewrites() {
        return [{
            source: '/:path',
            destination: '/api/:path'
        }];
    }
}

module.exports = nextConfig
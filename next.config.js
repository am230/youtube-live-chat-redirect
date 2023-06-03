/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['localhost']
    },

    async rewrites() {
        return [{
            source: '/:path',
            destination: '/api/:path'
        }];
    }
}

module.exports = nextConfig
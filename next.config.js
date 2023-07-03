/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.slack-edge.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    SLACK_TOKEN: process.env.SLACK_TOKEN,
  }
}

module.exports = nextConfig
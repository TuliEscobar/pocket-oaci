import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    // Enable static export for Capacitor
    // output: 'export',
    // Disable image optimization for static export
    images: {
        unoptimized: true,
    },
    // Optional: Add trailing slashes for better compatibility
    trailingSlash: true,
};

export default withNextIntl(nextConfig);

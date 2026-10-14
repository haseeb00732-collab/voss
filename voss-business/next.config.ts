import type { NextConfig } from 'next';
// A static shell keeps hosting free. Supabase authenticates and authorizes every data request.
const config: NextConfig = { output: 'export', trailingSlash: true, images: { unoptimized: true }, experimental: { cpus: 1 }, webpack(config) { config.cache = false; return config; } };
export default config;

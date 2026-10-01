import type { NextConfig } from 'next';
const config:NextConfig={serverExternalPackages:['pg','@electric-sql/pglite'],async headers(){return [{source:'/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Frame-Options',value:'DENY'}]}]}};export default config;

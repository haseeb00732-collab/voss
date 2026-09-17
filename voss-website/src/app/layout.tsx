import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { StoreShell } from '@/components/store/StoreShell';
import './globals.css';
import './studio.css';
import './header.css';

const jost=localFont({src:'./fonts/Jost-subset.woff2',variable:'--font-jost',display:'swap',weight:'100 900'});
const site=process.env.NEXT_PUBLIC_SITE_URL;
export const metadata: Metadata = {
  ...(site?{metadataBase:new URL(site)}:{}),
  title:{default:'Handbags for Women in Pakistan | VOSS',template:'%s | VOSS'},
  description:'Explore the VOSS edit of structured totes, top handle handbags and coordinated bag sets. See every price in PKR, compare colours and choose your next everyday bag.',
  openGraph:{title:'VOSS — Carry your own style.',description:'A considered edit of handbags. Find your shape, explore the details and choose your colour.',siteName:'VOSS',locale:'en_PK',type:'website',...(site?{images:[{url:'/studio-cutouts/product-01-960.webp',width:960,height:1200}]}:{})},
  robots:{index:true,follow:true},
};
export const viewport: Viewport={themeColor:'#101010',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en" data-scroll-behavior="smooth" className={jost.variable}><body><StoreShell>{children}</StoreShell></body></html>;}

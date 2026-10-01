import './globals.css';
export const metadata={title:'VOSS Business',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header className="business-header"><span>VOSS</span><small>BUSINESS / PRIVATE</small></header>{children}</body></html>;}

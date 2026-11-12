import Script from 'next/script';

const pixelId = '1044542445337111';
const pixelScript = `
  if (location.hostname === 'www.voss.pk' || location.hostname === 'voss.pk') {
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod ?
        n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;
      n.loaded=true;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=true;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('set', 'autoConfig', false, '${pixelId}');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  }
`;

export function MetaPixel() {
  return <>
    <Script id="voss-meta-pixel" strategy="afterInteractive">{pixelScript}</Script>
    {process.env.VERCEL_ENV === 'production' && <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element -- Meta's one-pixel fallback */}
      <img width={1} height={1} style={{ display: 'none' }} alt=""
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`} />
    </noscript>}
  </>;
}

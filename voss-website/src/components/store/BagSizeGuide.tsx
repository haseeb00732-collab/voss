import type { BagMeasurements } from '@/lib/product-measurements';

export function BagSizeGuide({ name, colour, image, measurements }: {
  name: string; colour: string; image: string; measurements: BagMeasurements;
}) {
  const extra = [measurements.depth ? `Depth ${measurements.depth} in` : '', measurements.handleDrop ? `Handle drop ${measurements.handleDrop} in` : ''].filter(Boolean).join(' · ');
  return <svg className="v-size-guide" viewBox="0 0 960 1200" role="img" aria-label={`${name} in ${colour}: width ${measurements.width} inches, height ${measurements.height} inches. ${extra}. Main bag only; handles excluded.`}>
    <rect width="960" height="1200" fill="var(--v-ground)" />
    <text x="70" y="72" className="v-size-guide-kicker">VOSS / SIZE GUIDE</text>
    <image href={image} x="80" y="110" width="710" height="780" preserveAspectRatio="xMidYMid meet" />
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M145 960H755 M145 948V972 M755 948V972" />
      <path d="M820 400V875 M808 400H832 M808 875H832" />
    </g>
    <text x="450" y="1012" textAnchor="middle" className="v-size-guide-measure">Width {measurements.width} in</text>
    <text x="870" y="640" textAnchor="middle" transform="rotate(-90 870 640)" className="v-size-guide-measure">Height {measurements.height} in</text>
    {extra && <text x="480" y="1075" textAnchor="middle" className="v-size-guide-extra">{extra}</text>}
    <text x="480" y="1120" textAnchor="middle" className="v-size-guide-note">Main bag only · handles and accessories excluded</text>
    <text x="480" y="1154" textAnchor="middle" className="v-size-guide-note">Confirmed measurements · illustration not to scale</text>
  </svg>;
}

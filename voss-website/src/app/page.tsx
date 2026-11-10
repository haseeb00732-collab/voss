import { SalePanel } from '@/components/store/SalePanel';
import { Hero } from '@/components/Hero';
import { StudioCollection } from '@/components/store/StudioCollection';
import { DesertCampaign } from '@/components/store/DesertCampaign';
import { InstagramStudio } from '@/components/store/InstagramStudio';
import { igProfile } from '@/lib/instagram';
import { StyleCountWord } from '@/lib/catalogue';


export default function Home() {
  return <main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'VOSS', sameAs: [igProfile()] }) }} />
    <Hero />

    <div className="v-service-strip"><span>{StyleCountWord} handbag styles</span><i /><span>Prices in PKR</span><i /><span>Cash on Delivery</span></div>
    <SalePanel />
    <StudioCollection />
    <DesertCampaign />
    <section className="v-about-story v-about-story-text v-home-story"><div><span className="v-kicker">Our story</span><h2>A different kind<br/>of premium.</h2></div><div><p>We’re a young Pakistani brand with a love for fashion and a belief that good style shouldn’t cost a fortune.</p><a className="v-text-link" href="/about">Our Story ↗</a></div></section>
    <InstagramStudio />
  </main>;
}

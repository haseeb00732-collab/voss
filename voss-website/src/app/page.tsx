import { Hero } from '@/components/Hero';
import { StudioCollection } from '@/components/store/StudioCollection';
import { ColourCampaign } from '@/components/store/ColourCampaign';
import { InstagramStudio } from '@/components/store/InstagramStudio';
import { igProfile } from '@/lib/instagram';
import { StyleCountWord } from '@/lib/catalogue';
import { DeliveryOffer } from '@/components/store/DeliveryOffer';

export default function Home() {
  return <main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'VOSS', sameAs: [igProfile()] }) }} />
    <Hero />
    <DeliveryOffer />
    <div className="v-service-strip"><span>{StyleCountWord} handbag styles</span><i /><span>Prices in PKR</span><i /><span>Cash on Delivery</span></div>
    <StudioCollection />
    <ColourCampaign />
    <section className="v-about-story v-about-story-text v-home-story"><div><span className="v-kicker">Our story</span><h2>A different kind<br/>of premium.</h2></div><div><p>We’re a young Pakistani brand with a love for fashion and a belief that good style shouldn’t cost a fortune.</p><a className="v-text-link" href="/about">Our Story ↗</a></div></section>
    <InstagramStudio />
  </main>;
}

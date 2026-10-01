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
    <div className="v-service-strip"><span>{StyleCountWord} handbag styles</span><i /><span>Prices in PKR</span><i /><span>Order with VOSS on Instagram</span></div>
    <StudioCollection />
    <ColourCampaign />
    <InstagramStudio />
  </main>;
}

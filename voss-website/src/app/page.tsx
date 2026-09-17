import { Hero } from '@/components/Hero';
import { StudioCollection } from '@/components/store/StudioCollection';
import { TextureStudy } from '@/components/store/TextureStudy';
import { InstagramStudio } from '@/components/store/InstagramStudio';
import { igProfile } from '@/lib/instagram';

export default function Home() {
  return <main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'VOSS', sameAs: [igProfile()] }) }} />
    <Hero />
    <div className="v-service-strip"><span>Eight handbag styles</span><i /><span>Prices in PKR</span><i /><span>Order with VOSS on Instagram</span></div>
    <StudioCollection />
    <TextureStudy />
    <InstagramStudio />
  </main>;
}

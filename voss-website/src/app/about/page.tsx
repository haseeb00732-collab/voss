import type {Metadata} from 'next';
import Link from 'next/link';
export const metadata:Metadata={title:'Our Point of View',description:'The VOSS point of view: considered handbag shapes, clear photographs and prices you can see before you choose.'};
export default function About(){
  return <main id="main">
    <section className="v-about-intro v-section">
      <span className="v-kicker">Our point of view</span><h1>We begin<br/>with the bag.</h1>
      <div><p>The curve of a handle. The balance of a shape. The colour that feels right with the clothes you already love.</p><p>That is where our edit begins. VOSS brings together handbags for women in Pakistan who want to take a closer look before they choose.</p></div>
    </section>
    <section className="v-about-story v-about-story-text">
      <div><span className="v-kicker">The details, in view</span><h2>Less guesswork.<br/>More good form.</h2></div>
      <div><p>A price should be easy to find. Colours should be easy to compare. And a product photograph should help you understand the bag, from its outline to its smaller details.</p><p>Our collection brings those things together. When you need more information, speak to VOSS before you order. We want you to choose with a clear picture.</p><Link href="/collection" className="v-text-link">Explore the collection ↗</Link></div>
    </section>
  </main>;
}

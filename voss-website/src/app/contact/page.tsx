import type { Metadata } from 'next';
import { PolicyPage } from '@/components/store/PolicyPage';
import { FACEBOOK_PAGE } from '@/lib/whatsapp';
export const metadata: Metadata = { title: 'Contact VOSS', description: 'Contact the VOSS online store on WhatsApp, Instagram or Facebook for product and order help.' };
export default function Contact() {
  return <PolicyPage title="Here to help." intro="A question about a colour, your order or the next steps? Talk to us.">
    <section><h2>An online-only store</h2><p>VOSS does not have a physical shop open to visitors. Please contact our official accounts for product questions and order support.</p><p>You can also find us on <a href={FACEBOOK_PAGE} target="_blank" rel="noreferrer">Facebook: Vosspk</a>.</p></section>
    <section><h2>Help us find your order</h2><p>Include your order reference, if you have one, and the mobile number used when ordering. Send personal order details privately, rather than in a public comment.</p></section>
  </PolicyPage>;
}

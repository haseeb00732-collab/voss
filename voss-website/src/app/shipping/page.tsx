import type { Metadata } from 'next';
import { PolicyPage } from '@/components/store/PolicyPage';
export const metadata: Metadata = { title: 'Delivery & Payment', description: 'VOSS cash-on-delivery information, 3–8 day delivery estimate and the first 30 website orders delivery offer.' };
export default function Shipping() {
  return <PolicyPage title="Delivery & payment." intro="Know the next steps before you order.">
    <section><h2>Cash on delivery</h2><p>Pay your order total when your parcel arrives. No payment is collected online.</p></section>
    <section><h2>Lahore delivery in 3–8 days</h2><p>We currently deliver within Lahore only. Our delivery estimate is 3–8 days. Timing can vary with your address, courier service and circumstances outside our control. Contact VOSS if your parcel has not arrived within the expected period.</p><p>Provide a complete Lahore address and a mobile number where you can be reached. For other cities, contact us about future availability.</p></section>
    <section><h2>A welcome from VOSS</h2><p>The first 30 successfully placed website orders receive free delivery. This is a store-wide launch offer, not 30 orders per customer. Eligibility is confirmed when an order is saved; adding items to your bag does not reserve a free-delivery place.</p><p>Your delivery charge and total will be shown before you submit an active website checkout. For orders arranged through WhatsApp or Instagram, ask VOSS to confirm the delivery charge in writing before placing the order.</p></section>
    <section><h2>Changes to your address</h2><p>Message us as soon as possible with your order reference and the correct details. Once a parcel has been dispatched, changes may not be possible.</p></section>
  </PolicyPage>;
}

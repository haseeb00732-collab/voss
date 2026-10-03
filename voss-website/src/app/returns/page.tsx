import type { Metadata } from 'next';
import { PolicyPage } from '@/components/store/PolicyPage';
export const metadata: Metadata = { title: 'Returns & Exchanges', description: 'Contact VOSS about incorrect or damaged items, cancellations and exchange eligibility before ordering.' };
export default function Returns() {
  return <PolicyPage title="Returns & exchanges." intro="Let us help you with your order.">
    <section><h2>An incorrect or damaged item</h2><p>If your order arrives incorrectly or appears damaged, contact VOSS promptly with your order reference, a description of the problem and clear photographs. Keep the item and packaging while we review the issue and explain the next steps.</p><p>Please contact us before sending a parcel back so we can give you the correct return instructions. VOSS is online-only and does not have a public shop for walk-in returns.</p></section>
    <section><h2>Confirm the terms before purchasing</h2><p>Our general return and exchange window, change-of-mind eligibility and return-delivery charges are not yet published. Please ask VOSS for written confirmation before placing an order. This page does not establish a no-returns policy or limit your rights under applicable consumer law.</p></section>
    <section><h2>Need to cancel?</h2><p>Contact us as soon as possible with your order reference. We will check whether the order has been dispatched and explain the available options.</p></section>
  </PolicyPage>;
}

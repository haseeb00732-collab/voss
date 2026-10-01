import type { Metadata } from 'next';
import { Checkout } from '@/components/store/Checkout';
export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };
export default function CheckoutPage() { return <main id="main" className="v-section v-checkout-page"><div className="v-page-heading"><span className="v-kicker">One step closer</span><h1>Make it yours.</h1><p>Your selection. Your details. Your VOSS.</p></div><Checkout /></main>; }

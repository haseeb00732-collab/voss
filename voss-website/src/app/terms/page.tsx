import type { Metadata } from 'next';
import Link from 'next/link';
import { PolicyPage } from '@/components/store/PolicyPage';
export const metadata: Metadata = { title: 'Terms & Conditions', description: 'Read the VOSS terms for prices, cash-on-delivery orders, product information and customer support.' };
export default function Terms() {
  return <PolicyPage title="Terms & conditions." intro="Please read these terms before placing an order with VOSS.">
    <section><h2>Ordering with VOSS</h2><p>VOSS sells handbags through this website and our official social accounts. Adding an item to your bag does not place an order or reserve stock. When website checkout is available, an order is received only after a successful submission displays your order reference.</p><p>A received order is subject to availability and confirmation by VOSS. If an item is unavailable or an order cannot be fulfilled, we will contact you using the details you supplied. A WhatsApp draft is not sent until you press Send in WhatsApp.</p></section>
    <section><h2>Prices and payment</h2><p>Prices are shown in Pakistani rupees (PKR). Review your selected colour, quantity, delivery charge and total before submitting. Payment is cash on delivery; we do not collect card details or take payment online.</p><p>If we discover a pricing error after submission, we will contact you before proceeding. We will not substitute an item or increase your confirmed total without your agreement.</p></section>
    <section><h2>Product information</h2><p>Photographs help you compare the design and available colours. Lighting and screens can affect how colours appear. Contact us before ordering if you need exact measurements, material information or confirmation of included accessories.</p></section>
    <section><h2>Delivery, changes and returns</h2><p>Delivery normally takes 3–8 days. See our <Link href="/shipping">delivery information</Link>. Contact VOSS promptly if you need to correct your address or cancel; an order already dispatched may not be changeable.</p><p>Please read the <Link href="/returns">returns and exchanges information</Link> and confirm any unanswered policy details with VOSS before purchasing. These terms do not exclude rights you have under applicable consumer law.</p></section>
    <section><h2>Your details</h2><p>Please provide accurate contact and delivery information so we can fulfil your order. Our <Link href="/privacy">privacy notice</Link> explains how that information is used.</p></section>
  </PolicyPage>;
}

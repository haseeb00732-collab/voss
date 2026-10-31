import type {Metadata} from 'next';
import Link from 'next/link';
import {PolicyPage} from '@/components/store/PolicyPage';
import {CopySections} from '@/components/store/CopySections';
import {TERMS} from '@/lib/website-copy';
export const metadata:Metadata={title:"Terms & conditions",description:"VOSS purchasing terms: availability, PKR prices, cash on delivery, Lahore delivery, exchanges and consumer rights."};
export default function Page(){return <PolicyPage title="Terms & conditions." intro="Please read these terms before placing an order with VOSS."><CopySections sections={TERMS}/><p>Read our full <Link href="/returns">Returns & Exchanges policy</Link>, <Link href="/shipping">Delivery & Payment information</Link> and <Link href="/privacy">Privacy Notice</Link>.</p></PolicyPage>;}

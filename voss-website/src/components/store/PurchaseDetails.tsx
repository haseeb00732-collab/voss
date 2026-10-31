import Link from 'next/link';
import {DELIVERY_ESTIMATE,EXCHANGE_SUMMARY} from '@/lib/website-copy';
export function PurchaseDetails(){return <div className="v-purchase-details"><span className="v-kicker">The details matter.</span><p>Explore colours, photographs and measurements before making it yours.</p><dl><div><dt>Delivery</dt><dd>Lahore · {DELIVERY_ESTIMATE}</dd></div><div><dt>Payment</dt><dd>Cash on Delivery</dd></div></dl><p>{EXCHANGE_SUMMARY}</p><Link href="/returns">View full policy ↗</Link></div>;}

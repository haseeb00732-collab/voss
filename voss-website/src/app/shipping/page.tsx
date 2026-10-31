import type {Metadata} from 'next';
import {PolicyPage} from '@/components/store/PolicyPage';
import {CopySections} from '@/components/store/CopySections';
import {SHIPPING} from '@/lib/website-copy';
import {whatsappLink} from '@/lib/whatsapp';
export const metadata:Metadata={title:"Delivery & payment",description:"Lahore delivery in 2–4 calendar days after confirmation. Cash on Delivery; first 30 eligible website orders free, then Rs 150."};
export default function Page(){return <PolicyPage title="Delivery & payment." intro="Good things on their way."><CopySections sections={SHIPPING}/><a className="v-button" href={whatsappLink("Hello VOSS, please help me check my delivery. My order number is: ")} target="_blank" rel="noreferrer">Check my delivery ↗</a></PolicyPage>;}

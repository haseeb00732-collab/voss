import type {Metadata} from 'next';
import {PolicyPage} from '@/components/store/PolicyPage';
import {CopySections} from '@/components/store/CopySections';
import {RETURNS} from '@/lib/website-copy';
import {whatsappLink} from '@/lib/whatsapp';
export const metadata:Metadata={title:"Returns & exchanges",description:"Seven-day exchanges for eligible unused VOSS bags. Read the process, shipping costs and remedies for faulty, damaged or incorrect items."};
export default function Page(){return <PolicyPage title="Returns & exchanges." intro="A little peace of mind, with every purchase."><p>We want you to love what you carry. If something isn’t quite right, here’s how we can help.</p><CopySections sections={RETURNS}/><a className="v-button" href={whatsappLink("Hello VOSS, I would like to request a return or exchange. My order number is: ")} target="_blank" rel="noreferrer">Start a return or exchange ↗</a></PolicyPage>;}

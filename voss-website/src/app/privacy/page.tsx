import type {Metadata} from 'next';
import {PolicyPage} from '@/components/store/PolicyPage';
import {CopySections} from '@/components/store/CopySections';
import {PRIVACY} from '@/lib/website-copy';
export const metadata:Metadata={title:"Your privacy",description:"How VOSS uses order and support information, browser storage and approved Google team accounts."};
export default function Page(){return <PolicyPage title="Your privacy." intro="The information we need, and what we use it for."><CopySections sections={PRIVACY}/></PolicyPage>;}

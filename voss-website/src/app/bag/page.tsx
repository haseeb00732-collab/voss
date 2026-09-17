import type {Metadata} from 'next';
import {Bag} from '@/components/store/Bag';
export const metadata:Metadata={title:'Your Bag',robots:{index:false,follow:true}};
export default function BagPage(){return <main id="main" className="v-section v-bag-page"><div className="v-page-heading"><span className="v-kicker">A considered selection</span><h1>Your bag.</h1><p>Review your colours and quantities, then confirm with VOSS.</p></div><Bag/></main>;}

import type {Metadata} from 'next';
import {Bag} from '@/components/store/Bag';
export const metadata:Metadata={title:'Your Bag',robots:{index:false,follow:true}};
export default function BagPage(){return <main id="main" className="v-section v-bag-page"><div className="v-page-heading"><span className="v-kicker">Good choice.</span><h1>Your bag.</h1><p>Take one more look at your colour, quantity and total before checkout.</p></div><Bag/></main>;}

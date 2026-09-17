import type {Metadata} from 'next';
import {CollectionBrowser} from '@/components/store/CollectionBrowser';
export const metadata:Metadata={title:'Shop Handbags, Totes & Bag Sets in Pakistan',description:'Compare the current VOSS handbag collection. Explore colours, product photographs and prices in PKR for totes, top handle bags and coordinated sets.'};
export default async function Collection({searchParams}:{searchParams:Promise<{shape?:string|string[]}>}){
  const {shape}=await searchParams;
  const category=typeof shape==='string'&&['Totes','Top handle','Bag sets'].includes(shape)?shape:'All bags';
  return <main id="main" className="v-section v-collection-page"><div className="v-page-heading"><span className="v-kicker">The collection / VOSS</span><h1>Handbags,<br/>clearly considered.</h1><p>Choose a shape. Take a closer look at the details. Find a colour you’ll reach for again.</p></div><CollectionBrowser key={category} initialCategory={category}/></main>;
}

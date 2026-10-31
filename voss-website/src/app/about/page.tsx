import { ArrowIcon } from '@/components/ArrowIcon';
import type {Metadata} from 'next';
import Link from 'next/link';
import {STORY} from '@/lib/website-copy';
export const metadata:Metadata={title:'Our Story',description:'A young Pakistani-owned brand from Lahore. A different kind of premium, made for your kind of style.'};
export default function About(){return <main id="main" className="v-brand-story"><section className="v-about-intro v-section"><span className="v-kicker">Our story</span><h1>{STORY[0].title}</h1><div>{STORY[0].paragraphs.map(p=><p key={p}>{p}</p>)}</div></section>{STORY.slice(1).map(section=><section className="v-about-story v-about-story-text" key={section.title}><div><h2>{section.title}</h2></div><div>{section.paragraphs.map(p=><p key={p}>{p}</p>)}</div></section>)}<div className="v-section v-story-cta"><Link href="/collection" className="v-button">Explore the Collection <ArrowIcon direction="up-right"/></Link></div></main>;}

import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
export default function NotFound(){return <main id="main" className="v-section v-empty"><span className="v-kicker">Page not found</span><h1>A different direction.</h1><p>This page is no longer part of the current edit.</p><Link href="/collection" className="v-button">Explore the collection <ArrowIcon direction="up-right" /></Link></main>;}

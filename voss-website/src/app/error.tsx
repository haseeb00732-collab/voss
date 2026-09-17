'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{error:Error & {digest?:string};reset:()=>void}){return <main id="main" className="v-section v-empty"><span className="v-kicker">A moment, please</span><h1>This page couldn’t open.</h1><p>Please try again. Your saved bag stays in this browser.</p><button className="v-button" onClick={reset}>Try again ↻</button><Link className="v-text-link" href="/collection">Return to the collection ↗</Link></main>;}

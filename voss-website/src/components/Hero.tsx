'use client';
import { ArrowIcon } from '@/components/ArrowIcon';
import {useEffect,useRef,useState} from 'react';
import {igDirectMessage,igProfile} from '@/lib/instagram';
import {STYLE_COUNT} from '@/lib/catalogue';

const FILM_SPEED = 1.5;

export function Hero() {
  const video=useRef<HTMLVideoElement>(null);
  const manuallyPaused=useRef(false);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{
    const el=video.current;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(!el) return;
    let visible=true;
    const start=()=>{el.playbackRate=FILM_SPEED;if(reduced.matches || document.hidden || !visible || manuallyPaused.current){el.pause();return;}if(!el.ended)void el.play().catch(()=>{});};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start();},{threshold:.1});
    observer.observe(el);
    start();
    reduced.addEventListener('change',start);
    document.addEventListener('visibilitychange',start);
    return ()=>{observer.disconnect();reduced.removeEventListener('change',start);document.removeEventListener('visibilitychange',start);el.pause();};
  },[]);
  return <section className="v-hero" aria-label="VOSS signature bag film">
    <video ref={video} className="v-hero-film" muted playsInline preload="auto" poster="/hero/poster.avif" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} aria-label="A VOSS bag revealed in warm light"><source src="/hero/hero-1600.webm" type="video/webm"/><source src="/hero/hero-1600.mp4" type="video/mp4"/></video>
    <div className="v-hero-shade"/>
    <div className="v-hero-top"><span className="v-kicker">VOSS / The collection</span></div>
    <div className="v-hero-copy"><span className="v-kicker">Handbags for your every day</span><h1>CARRY YOUR<br/>OWN STYLE.</h1><p>Find your shape. Choose your colour.<br/>Make it part of your day.</p><div className="v-hero-actions"><a href="#collection" className="v-text-link">Shop the collection <span><ArrowIcon direction="up-right" /></span></a><a href={igDirectMessage() ?? igProfile()} target="_blank" rel="noreferrer" className="v-hero-instagram">Order on Instagram <ArrowIcon direction="up-right" /></a></div></div>
    <button className="v-film-control" onClick={()=>{const el=video.current;if(!el)return;if(playing){manuallyPaused.current=true;el.pause();}else {manuallyPaused.current=false;if(el.ended)el.currentTime=0;el.playbackRate=FILM_SPEED;void el.play().catch(()=>{});}}} aria-label={playing?'Pause hero animation':'Play hero animation'}>{playing?'Pause film Ⅱ':<>{"Replay film "}<ArrowIcon direction="refresh" /></>}</button><span className="v-hero-index" aria-hidden="true">01 — {String(STYLE_COUNT).padStart(2,'0')}</span>
  </section>;
}

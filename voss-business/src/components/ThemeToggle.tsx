'use client';
import {useEffect,useState} from 'react';
export function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{const value=localStorage.getItem('voss-theme');const next=value?value==='dark':matchMedia('(prefers-color-scheme: dark)').matches;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';},[]);
 function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';localStorage.setItem('voss-theme',next?'dark':'light');}
 return <button className="theme-toggle secondary" aria-label={dark?'Use light appearance':'Use dark appearance'} aria-pressed={dark} onClick={toggle}>{dark?'Light':'Dark'}</button>;
}

'use client';
import {useEffect,useRef,useState} from 'react';
import {readBusiness,type Data} from '@/lib/business';

export function OrderAlerts({preview=false}:{preview?:boolean}) {
  const [enabled,setEnabled]=useState(false),[message,setMessage]=useState('');
  const latest=useRef<string|null>(null);
  useEffect(()=>{
    if(preview)return;
    let cancelled=false;
    async function check(){try{
      const result=await readBusiness<Data>('overview');
      if(cancelled)return;
      const newest=result.orders.reduce((max,o)=>o.created_at>max?o.created_at:max,'');
      const fresh=latest.current===null?[]:result.orders.filter(o=>o.created_at>latest.current!);
      latest.current=newest||latest.current;
      if(fresh.length){setMessage(`${fresh.length} new order${fresh.length>1?'s':''} received. Open Orders to review.`);
        if(enabled&&'Notification' in window&&Notification.permission==='granted')new Notification('New VOSS order',{body:'Open your private dashboard to review the order.',tag:'voss-new-order'});
      }
    }catch{ /* Main dashboard shows connection errors. Never reveal order data in notifications. */ }}
    void check();const interval=setInterval(()=>void check(),30000);
    return()=>{cancelled=true;clearInterval(interval);};
  },[enabled,preview]);
  async function enable(){if(!('Notification' in window)){setMessage('This browser does not support desktop notifications. New orders still appear here.');return;}const permission=await Notification.requestPermission();setEnabled(permission==='granted');setMessage(permission==='granted'?'Alerts enabled while this dashboard tab is open.':'Browser alerts are blocked. You can still review orders here.');}
  return <section className="service-note"><div><strong>New-order alerts</strong><p role="status">{message||'Keep this dashboard open to see new orders. Email and closed-app phone alerts need sender setup.'}</p></div><button className="secondary" onClick={()=>void enable()} disabled={enabled||preview}>{enabled?'Browser alerts enabled':'Enable browser alerts'}</button></section>;
}

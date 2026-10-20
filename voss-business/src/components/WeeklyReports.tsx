'use client';
import {useEffect,useState} from 'react';
import {cloud} from '@/lib/business';
type Report={week_start:string;created_at:string;email_state:string;pdf_base64:string;report:{lines:string[]}};
export function WeeklyReports(){const [rows,setRows]=useState<Report[]>([]),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let active=true;cloud.rpc('voss_weekly_reports').then(({data,error})=>{if(!active)return;setLoaded(true);if(error)setError('Weekly archive is temporarily unavailable.');else setRows(data||[]);});return()=>{active=false;};},[]);
 function pdf(r:Report){const bytes=Uint8Array.from(atob(r.pdf_base64.replace(/\s/g,'')),c=>c.charCodeAt(0)),u=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=u;a.download=`voss-week-${r.week_start}.pdf`;a.click();URL.revokeObjectURL(u);}
 return <section className="panel"><header className="insight-heading"><div><h2>Weekly reports</h2><p>Monday at 9:00 AM Pakistan time. Private snapshots with downloadable PDFs.</p></div></header>{error&&<p className="alert">{error}</p>}{!loaded?<p className="empty">Loading reports…</p>:!rows.length?<p className="empty">No weekly snapshot yet. Your live finance totals remain available above.</p>:rows.map(r=><details className="insight-details" key={r.week_start}><summary>Week beginning {r.week_start} · {r.email_state==='sent'?'Email sent':'Saved in app · email not sent'}</summary><button className="secondary" onClick={()=>pdf(r)}>Download saved PDF</button>{r.report.lines.filter(Boolean).map((line,i)=><p key={i}>{line}</p>)}</details>)}</section>;
}

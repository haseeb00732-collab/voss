'use client';
import {useCallback,useEffect,useState} from 'react';
import {cloud} from '@/lib/business';
type Member={id:string;email:string;approved:boolean;role:string|null};
const DASHBOARD_URL='https://voss-business.pages.dev/';
export function TeamAccess(){
  const [members,setMembers]=useState<Member[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const refresh=useCallback(async()=>{try{const {data,error}=await cloud.rpc('voss_business_team');if(error)throw error;setMembers(data as Member[]);setError('');}catch{setError('Could not load team access. Try refreshing requests.');}},[]);
  useEffect(()=>{void refresh();const onVisible=()=>{if(document.visibilityState==='visible')void refresh();};document.addEventListener('visibilitychange',onVisible);return()=>document.removeEventListener('visibilitychange',onVisible);},[refresh]);
  async function change(member:Member){setBusy(true);setError('');setNotice('');try{const {data,error}=await cloud.rpc('voss_business_team',{p_user:member.id,p_approve:!member.approved});if(error)throw error;setMembers(data as Member[]);setNotice(`${member.email}: ${member.approved?'access revoked':'owner access approved'}.`);}catch{setError('Could not change access. Refresh requests and try again.');}finally{setBusy(false);}}
  async function role(member:Member,value:string){setBusy(true);setError('');setNotice('');try{const {error}=await cloud.rpc('voss_team_role',{p_user:member.id,p_role:value});if(error)throw error;await refresh();setNotice(`${member.email}: access level updated.`);}catch{setError('Could not update the access level. Refresh requests and try again.');}finally{setBusy(false);}}
  async function copyLink(){try{await navigator.clipboard.writeText(DASHBOARD_URL);setNotice('Dashboard link copied. Send it to each owner.');}catch{setNotice('Select and copy the dashboard address below.');}}
  const pending=members.filter(m=>!m.approved).length;
  return <section className="panel settings-card" id="team-access" aria-labelledby="team-access-title"><span className="eyebrow">PRIVATE TEAM</span><h2 id="team-access-title">Approve your team.</h2>
    <ol><li>Send each owner the dashboard link below.</li><li>They choose <strong>Continue with Google</strong> and sign in with their own Gmail.</li><li>Return here, refresh requests, check their email, then choose <strong>Approve owner access</strong>.</li></ol>
    <p><a href={DASHBOARD_URL}>{DASHBOARD_URL.replace('https://','')}</a></p>
    <div className="button-row"><button className="secondary" onClick={()=>void copyLink()}>Copy dashboard link</button><button className="secondary" disabled={busy} onClick={()=>void refresh()}>Refresh requests</button></div>
    <p className="small-note">{pending?`${pending} ${pending===1?'person is':'people are'} waiting for approval.`:'No pending requests.'} Only approve the owners you recognise. They do not need access to Supabase or Cloudflare.</p>
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
    {[...members].sort((a,b)=>Number(a.approved)-Number(b.approved)||a.email.localeCompare(b.email)).map(m=><div key={m.id} className="team-member"><strong>{m.email}</strong><p>{m.role==='technical'?'Technical administrator':m.approved?(m.role==='viewer'?'Viewer · read only':'Owner · full business access'):'Waiting for approval'}</p>{m.approved&&m.role!=='technical'&&<label>Access level<select value={m.role||'owner'} disabled={busy} onChange={e=>void role(m,e.target.value)}><option value="owner">Owner · can edit</option><option value="viewer">Viewer · read only</option></select></label>}{m.role!=='technical'&&<button className="secondary" disabled={busy} onClick={()=>void change(m)}>{m.approved?'Revoke access':'Approve owner access'}</button>}</div>)}
  </section>;
}

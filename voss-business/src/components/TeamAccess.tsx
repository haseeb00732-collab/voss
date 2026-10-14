'use client';
import {useCallback,useEffect,useState} from 'react';
import {cloud} from '@/lib/business';
type Member={id:string;email:string;approved:boolean;role:string|null};
export function TeamAccess(){
  const [members,setMembers]=useState<Member[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const refresh=useCallback(async()=>{const {data,error}=await cloud.rpc('voss_business_team');if(error)setError('Could not load team access.');else setMembers(data as Member[]);},[]);
  useEffect(()=>{void refresh();},[refresh]);
  async function change(member:Member){setBusy(true);setError('');const {data,error}=await cloud.rpc('voss_business_team',{p_user:member.id,p_approve:!member.approved});if(error)setError('Could not change access. Refresh and try again.');else setMembers(data as Member[]);setBusy(false);}
  return <section className="panel settings-card"><span className="eyebrow">PRIVATE TEAM</span><h2>Approve your team.</h2><p>Share this dashboard link. Each owner creates an account and verifies their email, then signs in to request access. Approve only the people you know.</p><p><a href="https://voss-business.haseeb00732.workers.dev/">voss-business.haseeb00732.workers.dev</a></p>{error&&<p role="alert">{error}</p>}<button className="secondary" disabled={busy} onClick={()=>void refresh()}>Refresh requests</button>{members.map(m=><div key={m.id} className="team-member"><strong>{m.email}</strong><p>{m.role==='technical'?'Technical administrator':m.approved?'Owner · full order access':'Waiting for approval'}</p>{m.role!=='technical'&&<button className="secondary" disabled={busy} onClick={()=>void change(m)}>{m.approved?'Revoke access':'Approve owner access'}</button>}</div>)}</section>;
}

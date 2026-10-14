'use client';
import { useState, type FormEvent } from 'react';
import { cloud } from '@/lib/business';

export function Registration({back}:{back:()=>void}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const password=String(form.get('password'));
    if(password!==form.get('confirm')) { setError('The passwords do not match.'); return; }
    setBusy(true);setError('');
    try {
      const {error}=await cloud.auth.signUp({email:String(form.get('email')).trim(),password,
        options:{emailRedirectTo:window.location.origin+'/'}});
      if(error) throw error;
      setSent(true);
    } catch {
      setError('We could not create your account. Try again later or contact Haseeb to check email setup.');
    } finally {setBusy(false);}
  }
  return <div className="password-screen"><form className="login-form" onSubmit={submit}>
    <span className="wordmark">VOSS</span><h1>Create your account.</h1>
    <p>Use your own email and password. Verify your email, then ask Haseeb to approve your business access.</p>
    {sent?<p role="status" className="notice">Check your inbox for a confirmation link. If you already have an account, return to sign in or reset your password. Creating an account does not grant access to orders.</p>:<>
      <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
      <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
      <small>Use at least 12 characters. Never share your password.</small>
      {error&&<p role="alert" className="alert">{error}</p>}
      <button className="primary" disabled={busy}>{busy?'Creating account…':'Create account'}</button>
    </>}
    <button type="button" className="text-button" onClick={back}>Back to sign in</button>
  </form></div>;
}

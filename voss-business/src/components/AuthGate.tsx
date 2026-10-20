'use client';
import { useEffect, useRef, useState } from 'react';
import { authErrorMessage, startGoogleSignIn } from '@/lib/auth';
import { BusinessLogo } from './BusinessLogo';
import './AuthGate.css';

function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3a10 10 0 0 0 0 9.2L6.4 14Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.4L6.4 10A6 6 0 0 1 12 5.9Z"/></svg>;
}

export function AuthGate({ error = '' }: { error?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const attempt = useRef(false);
  useEffect(() => {
    // Returning with the browser Back button can restore the page from its navigation cache.
    const restore = () => { attempt.current = false; setBusy(false); };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  async function signIn() {
    if (attempt.current) return;
    attempt.current = true; setBusy(true); setMessage('');
    try { await startGoogleSignIn(); }
    catch (error) { setMessage(authErrorMessage(error)); }
    finally { attempt.current = false; setBusy(false); }
  }
  return <main className="login-screen">
    <div className="login-brand"><BusinessLogo/><h1>A clear view<br/>of your business.</h1><p>Orders, finances and daily operations.<br/>Your private workspace, wherever you are.</p></div>
    <section className="login-form" aria-labelledby="sign-in-title">
      <span className="eyebrow">PRIVATE TEAM ACCESS</span><h2 id="sign-in-title">Welcome to VOSS.</h2>
      <p>Continue with your own Google account. Your Gmail works here—there’s no separate VOSS password.</p>
      {(message || error) && <p role="alert" className="alert">{message || error}</p>}
      <button type="button" className="google-sign-in" disabled={busy} onClick={() => void signIn()}><GoogleMark/><span>{busy ? 'Connecting to Google…' : 'Continue with Google'}</span></button>
      <small>Your first sign-in creates your account. Business records stay private until an administrator approves your access.</small>
      <p className="auth-footnote">Use the same Google account each time. Sign out when you finish on a shared device.</p>
    </section>
  </main>;
}

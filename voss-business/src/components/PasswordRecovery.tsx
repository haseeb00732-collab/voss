'use client';
import { useState, type FormEvent } from 'react';
import { cloud } from '@/lib/business';

export function PasswordRecovery({ back }: { back: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email')).trim();
    setBusy(true);
    setError('');
    try {
      const { error } = await cloud.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setMessage('If this email has an account, a password reset link has been requested. Check your inbox and spam folder.');
    } catch {
      setError('The reset email could not be requested. Please try again later or contact the account administrator.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="password-screen"><form className="login-form" onSubmit={recover}>
    <span className="wordmark">VOSS</span>
    <h1>Reset your password.</h1>
    <p>Use the email connected to your approved owner account.</p>
    <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
    {message && <p role="status" className="notice">{message}</p>}
    {error && <p role="alert" className="alert">{error}</p>}
    <button className="primary" disabled={busy || !!message}>{busy ? 'Requesting link…' : 'Send reset link'}</button>
    <button type="button" className="text-button" onClick={back}>Back to sign in</button>
  </form></div>;
}

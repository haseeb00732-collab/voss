import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { cloud, supabasePublishableKey, supabaseUrl } from './business';
import { authErrorMessage, cleanAuthCallbackUrl, readAuthCallback } from './auth-errors';

export { authErrorMessage } from './auth-errors';

export async function startGoogleSignIn() {
  // Check public settings before leaving the app; no user or privileged credentials are sent.
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabasePublishableKey },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Network settings check failed');
  const settings = await response.json() as { external?: { google?: boolean } };
  if (settings.external?.google !== true) throw new Error('provider_disabled');
  // Accessing storage can fail in locked-down browsers. Report it before redirecting.
  const probe = 'voss-auth-storage-check';
  try { window.sessionStorage.setItem(probe, '1'); window.sessionStorage.removeItem(probe); }
  catch { throw new Error('PKCE browser storage unavailable'); }
  const { error } = await cloud.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/`, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw error;
}

/** Keep callbacks synchronous; Supabase auth calls must run outside onAuthStateChange. */
export function subscribeToAuth(
  onSession: (event: AuthChangeEvent, session: Session | null) => void,
  onError: (message: string) => void,
) {
  let active = true;
  let settled = false;
  let revision = 0;
  const callback = readAuthCallback(window.location.href);
  const timer = window.setTimeout(() => {
    if (!active || settled) return;
    onError('Checking your session took too long. Refresh this page to try again.');
    onSession('INITIAL_SESSION', null);
  }, 25000);
  const { data: { subscription } } = cloud.auth.onAuthStateChange((event, session) => {
    if (!active) return;
    revision++;
    settled = true;
    window.clearTimeout(timer);
    onSession(event, session);
  });
  const initialRevision = revision;
  void (async () => {
    try {
      // The SDK automatically exchanges a PKCE callback. Do not exchange its one-use code twice.
      const initialized = await cloud.auth.initialize();
      if (!active) return;
      if (callback.error || initialized.error) onError(authErrorMessage(callback.error || initialized.error));
      const { data, error } = await cloud.auth.getSession();
      if (!active) return;
      if (error) onError(authErrorMessage(error));
      else if (callback.hasCode && !data.session && !initialized.error) onError(authErrorMessage('code_verifier_missing'));
      if (revision === initialRevision) onSession('INITIAL_SESSION', data.session);
    } catch (error) {
      if (active) { onError(authErrorMessage(error)); if (revision === initialRevision) onSession('INITIAL_SESSION', null); }
    } finally {
      if (active) {
        settled = true;
        window.clearTimeout(timer);
        // Wait for SDK initialization before removing the code it needs to exchange.
        if (callback.hasCallback) window.history.replaceState(window.history.state, '', cleanAuthCallbackUrl(window.location.href));
      }
    }
  })();
  return () => { active = false; window.clearTimeout(timer); subscription.unsubscribe(); };
}

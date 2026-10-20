// Never render provider descriptions: callbacks can contain sensitive values or untrusted text.
export function authErrorMessage(error: unknown): string {
  const value = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const details = value.details && typeof value.details === 'object' ? value.details as Record<string, unknown> : {};
  const description = [value.code, value.name, value.message, details.code, details.error, typeof error === 'string' ? error : ''].join(' ').toLowerCase();
  if (/provider_disabled|provider is not enabled|unsupported provider/.test(description)) return 'Google sign-in is still being connected. Please ask your administrator to finish setup, then try again.';
  if (/access_denied|consent.*cancel|user.*cancel/.test(description)) return 'Google sign-in was canceled. Continue with Google whenever you’re ready.';
  if (/redirect_uri_mismatch|invalid_client|unauthorized_client/.test(description)) return 'Google sign-in needs a configuration update. Please contact your administrator.';
  if (/flow_state|code_verifier|pkce|bad_code|otp_expired/.test(description)) return 'This sign-in link has expired or belongs to another browser. Continue with Google again in this tab.';
  if (/timeout|abort|network|fetch|offline/.test(description)) return 'We could not connect to sign-in. Check your internet connection and try again.';
  if (/over_request_rate_limit|too many requests/.test(description)) return 'Too many sign-in attempts. Wait a moment, then try again.';
  return 'Google sign-in could not be completed. Please try again, or contact your administrator if it continues.';
}

const callbackKeys = ['code', 'sb_flow_id', 'error', 'error_code', 'error_description', 'access_token', 'refresh_token', 'provider_token', 'provider_refresh_token', 'token_type', 'expires_in', 'expires_at'];

export function readAuthCallback(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const read = (key: string) => url.searchParams.get(key) || hash.get(key);
  const error = read('error_code') || read('error');
  const hasCallback = callbackKeys.some(key => url.searchParams.has(key) || hash.has(key));
  return { hasCallback, hasCode: !!read('code'), error: error || (read('error_description') ? 'oauth_callback_error' : null) };
}

export function cleanAuthCallbackUrl(href: string): string {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const hasAuthHash = callbackKeys.some(key => hash.has(key));
  for (const key of callbackKeys) { url.searchParams.delete(key); hash.delete(key); }
  if (hasAuthHash) url.hash = hash.toString();
  return url.pathname + url.search + url.hash;
}

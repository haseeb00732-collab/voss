import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual client helpers with isolated browser and Supabase doubles.
// No real identities, tokens, external requests, or persisted sessions are used.
function load(file, imports = {}, globals = {}) {
  const source = readFileSync(new URL(`../src/lib/${file}.ts`, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: key => { assert.ok(key in imports, `Unexpected import ${key}`); return imports[key]; }, URL, URLSearchParams, AbortSignal, ...globals });
  return exports;
}
const errors = load('auth-errors');
for (const [input, expected] of [
  [{ code: 'provider_disabled' }, /still being connected/],
  [{ details: { error: 'access_denied' } }, /canceled/],
  [{ code: 'bad_code_verifier' }, /another browser/],
  [{ message: 'redirect_uri_mismatch' }, /configuration update/],
  [{ name: 'TimeoutError' }, /internet connection/],
  [{ message: 'secret-token-should-never-be-rendered' }, /could not be completed/],
]) assert.match(errors.authErrorMessage(input), expected);
assert.equal(errors.authErrorMessage({ message: 'secret-token-should-never-be-rendered' }).includes('secret-token'), false);
assert.equal(errors.readAuthCallback('https://example.test/?error=access_denied').error, 'access_denied');
assert.equal(errors.readAuthCallback('https://example.test/#error_code=provider_disabled').error, 'provider_disabled');
assert.equal(errors.readAuthCallback('https://example.test/?code=one-use-code').hasCode, true);
assert.equal(errors.cleanAuthCallbackUrl('https://example.test/?code=secret&tab=orders#error=access_denied&access_token=secret&keep=value'), '/?tab=orders#keep=value');
assert.equal(errors.cleanAuthCallbackUrl('https://example.test/?tab=orders#main'), '/?tab=orders#main');

function fixture({ href = 'https://example.test/', initialize, getSession, fetchSettings } = {}) {
  let listener;
  let unsubscribed = false;
  const timers = new Map(), replaced = [], oauth = [], events = [], messages = [];
  let nextTimer = 0;
  const window = {
    location: { href, origin: 'https://example.test' },
    history: { state: null, replaceState: (_state, _title, url) => replaced.push(url) },
    setTimeout: callback => { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id),
    sessionStorage: { setItem() {}, removeItem() {} },
  };
  const cloud = { auth: {
    initialize: initialize || (async () => ({ error: null })),
    getSession: getSession || (async () => ({ data: { session: null }, error: null })),
    onAuthStateChange: callback => { listener = callback; return { data: { subscription: { unsubscribe() { unsubscribed = true; } } } }; },
    signInWithOAuth: async input => { oauth.push(input); return { error: null }; },
  } };
  const api = load('auth', { './business': { cloud, supabaseUrl: 'https://example.test/cloud', supabasePublishableKey: 'public-test-key' }, './auth-errors': errors }, {
    window,
    fetch: fetchSettings || (async () => ({ ok: true, json: async () => ({ external: { google: true } }) })),
  });
  return { api, timers, replaced, oauth, events, messages, window,
    start: () => api.subscribeToAuth((event, session) => events.push({ event, session }), message => messages.push(message)),
    emit: (event, session) => listener(event, session), unsubscribed: () => unsubscribed,
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
{
  const f = fixture(); const stop = f.start(); await flush();
  assert.equal(f.events.length, 1); assert.equal(f.events[0].event, 'INITIAL_SESSION'); assert.equal(f.events[0].session, null);
  assert.equal(f.timers.size, 0); stop(); assert.equal(f.unsubscribed(), true);
}
{
  const f = fixture({ href: 'https://example.test/?error=access_denied&error_description=private-text' });
  f.start(); await flush(); assert.match(f.messages[0], /canceled/); assert.deepEqual(f.replaced, ['/']);
}
{
  const f = fixture({ href: 'https://example.test/?code=expired-code' });
  f.start(); await flush(); assert.match(f.messages[0], /another browser/); assert.deepEqual(f.replaced, ['/']);
}
{
  const session = { user: { id: 'approved-by-server-separately' } };
  const f = fixture({ href: 'https://example.test/?code=one-use-code', getSession: async () => ({ data: { session }, error: null }) });
  f.start(); await flush(); assert.equal(f.events[0].session, session); assert.equal(f.messages.length, 0); assert.deepEqual(f.replaced, ['/']);
}
{
  let finish; const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture({ getSession: () => pending }); f.start(); await flush();
  const next = { user: { id: 'new-account' } }; f.emit('SIGNED_IN', next);
  finish({ data: { session: null }, error: null }); await flush();
  assert.equal(f.events.length, 1); assert.equal(f.events[0].session, next);
}
{
  const f = fixture({ initialize: () => new Promise(() => {}) }); const stop = f.start();
  for (const callback of [...f.timers.values()]) callback();
  assert.match(f.messages[0], /took too long/); assert.equal(f.events[0].session, null); stop();
}
{
  let finish; const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture({ initialize: () => pending }); const stop = f.start(); stop(); finish({ error: null }); await flush();
  assert.equal(f.events.length, 0); assert.equal(f.messages.length, 0); assert.equal(f.replaced.length, 0);
}
{
  const f = fixture({ fetchSettings: async () => ({ ok: true, json: async () => ({ external: { google: false } }) }) });
  await assert.rejects(f.api.startGoogleSignIn(), /provider_disabled/); assert.equal(f.oauth.length, 0);
}
{
  const f = fixture({ fetchSettings: async () => { throw new Error('Network failed'); } });
  await assert.rejects(f.api.startGoogleSignIn(), /Network/); assert.equal(f.oauth.length, 0);
}
{
  const f = fixture(); await f.api.startGoogleSignIn();
  assert.equal(f.oauth.length, 1); assert.equal(f.oauth[0].provider, 'google');
  assert.equal(f.oauth[0].options.redirectTo, 'https://example.test/');
  assert.equal(f.oauth[0].options.queryParams.prompt, 'select_account');
}
console.log('Auth checks passed: private error messages, callbacks, session fallback/races/timeout/cleanup, provider availability, OAuth redirect.');

# VOSS Business owner handover

Share: **https://voss-business.pages.dev/**

The previous Workers address remains operational. This is the same dashboard, Supabase project, accounts, orders, stock and finance data. The branded Pages entrance fetches the existing app shell and uses its own copy of the same restricted authentication/data proxy. Scheduled jobs continue on the existing Worker; they have not been duplicated.

## Owners: first sign-in

1. Open the link in a normal browser, such as Chrome or Safari.
2. Choose **Continue with Google** and select your own Gmail account. A separate VOSS password is not needed.
3. Complete Google's sign-in yourself. Do not give passwords or verification codes to Haseeb.
4. Your first sign-in creates an account and displays **Waiting for approval**. This is expected; private records are still locked.
5. Tell Haseeb which email you used. After approval, choose **Check access again**, or refresh the page.
6. Use that same Gmail account every time. Sign out on shared devices.

## Haseeb: approve Zarbakht and Faizan

1. Open the dashboard and sign in with **haseeb00732@gmail.com**. This verified account has the **technical** role.
2. Choose **Settings** in the sidebar. On a phone, use the dashboard navigation to open Settings.
3. Find **Approve your team** under **PRIVATE TEAM**.
4. Choose **Refresh requests**. Pending requests appear before approved members.
5. Confirm each owner's email with them, then choose **Approve owner access** beside that email.
6. Leave their access level as **Owner · can edit** so they can maintain orders and finances. **Viewer · read only** is available for people who must not change records.
7. Use **Revoke access** if a person should lose business access. Never approve an email you do not recognise.

The Settings approval panel is visible only to the technical account. Owners do not receive infrastructure access or permission to approve strangers. Account registration alone never grants private-data access.

## Tested for this release

- Full existing suite: 21 owner checks, 29 team/checkout checks, email-outbox checks, 72 finance checks, additional finance-upgrade cases, 29 social checks, auth/session/callback checks and 27 proxy checks passed.
- New branded entrance tests cover same-origin authentication, blocked cross-origin requests, no forwarding of static-request credentials or OAuth callback codes, restricted methods and safe redirects.
- Production build and TypeScript passed.
- New URL reaches the correct Google account chooser and requests only email/profile. Its redirect points to `https://voss-business.pages.dev/`.
- Supabase now permits that exact redirect and the previous URL; default Site URL is the branded address.
- Live unauthenticated finance read returns HTTP 401; a request from another site's origin returns HTTP 403.
- Technical membership was verified in the live database. Owner credentials were not requested or impersonated; each owner must finish their own sign-in.

## Hosting and rollback

Cloudflare Pages project: `voss-business`; first deployment: `4c19d27f-a6b9-4248-b2cf-254e0357ea43`. Existing Worker updated to deployment `59b945b483624c0a9d1f35b93d22f0af` for the improved team panel. Previous Worker version: `bcccadd89c75499daf0ca83236e445bc`. Pre-change source/settings are saved privately in ignored `runtime/checkpoint-before-branded-link.json`.

Revert the team component commit and restore the previous Worker version to roll back its UI. To withdraw the branded entrance, share the previous dashboard URL again and restore the old Supabase default Site URL. Keep both exact redirect URLs while users transition. Do not delete accounts, financial records, orders or promotion counters to reverse a hostname change.

`business.voss.pk` is not configured: the current connection cannot manage DNS for that domain. No paid domain or hosting plan was purchased. Automatic email alerts, live Meta connections and scheduled off-site backups retain the setup limitations recorded in RELEASE-2026-10-20.md; this hostname release does not activate them.

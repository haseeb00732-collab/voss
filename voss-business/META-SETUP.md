# Connect VOSS's own Instagram and Meta Ads accounts

The dashboard works without this connection. Manual spend and CSV imports remain available in Finance. Google Ads uses CSV only. Never paste an access token into chat, a spreadsheet, browser code, GitHub or a screenshot.

## Before starting

1. Sign in to [Meta Business Suite](https://business.facebook.com/) as the person who controls VOSS's Facebook Page and ad account.
2. In Settings, confirm that the VOSS Facebook Page and Instagram account belong to the same business portfolio. Use the real VOSS Page: https://www.facebook.com/p/Vosspk-61593772016374/.
3. In Instagram, use a Business or Creator account. Link it to that Facebook Page. This integration uses the **Instagram API with Facebook Login** path; do not mix tokens or permissions from the separate Instagram Login path.
4. Check the ad account's currency is PKR and reporting time zone is Pakistan. The importer rejects non-PKR ad accounts rather than inventing exchange rates.

## Create the app

5. Open [Meta for Developers](https://developers.facebook.com/apps/) and choose Create App. Choose the business use case that offers Instagram API with Facebook Login and Marketing API; Meta's labels can vary by account.
6. Name it `VOSS Business`. Attach VOSS's business portfolio. Keep it for your own business assets initially.
7. Add the Instagram API with Facebook Login and Marketing API capabilities offered by the app dashboard. Add your own Facebook account as an app administrator/tester if needed.
8. In the app's permissions screen, request only the access used here: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, and `ads_read`. The account must also have the corresponding Page/ad-account asset access. `business_management` may be needed for business asset discovery; do not request publishing or ads-management permissions for this read-only integration.
9. Use [Graph API Explorer](https://developers.facebook.com/tools/explorer/) with **your VOSS app selected** to authorize those permissions for your own account. Choose the actual VOSS assets when Meta asks. Development mode only works for appropriately assigned app/business users; wider access can require review or business verification.

## Find the account IDs

10. In Graph API Explorer, run `GET /me/accounts?fields=id,name,instagram_business_account`. Find the VOSS Page. Save its Page ID and the `instagram_business_account.id`. That Instagram ID is different from the username.
11. In [Ads Manager](https://adsmanager.facebook.com/), find the ad-account number. Save the digits only, without the `act_` prefix.
12. In Meta's [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/), inspect the token, asset access, permissions and expiry. The debugger is Meta's own tool; do not send the token to other sites.
13. Follow the long-lived token instructions linked from the app dashboard. For business-owned assets, a properly assigned system user can be a more durable option when Meta makes it available. Give it only the Page/Instagram/ad-account permissions required. Tokens can still be revoked when asset access or business settings change.

## Save the private settings

14. Open Cloudflare Dashboard → Workers & Pages → `voss-business` → Settings → Variables and Secrets.
15. Add these as **Secrets**, using the values from your own app. Leave `JOB_SECRET` untouched; it is already a separate server job credential.

```text
META_ACCESS_TOKEN       the authorized own-business access token
META_GRAPH_VERSION      the supported version shown in your Meta app, e.g. vXX.X
META_IG_ACCOUNT_ID      digits from instagram_business_account.id
META_AD_ACCOUNT_ID      digits from Ads Manager, without act_
```

16. Save/deploy the secret changes. Do not put tokens into a `NEXT_PUBLIC_` variable. This scheduled integration reads them only inside Cloudflare.
17. The scheduled refresh runs at 00:15, 06:15, 12:15 and 18:15 UTC (05:15, 11:15, 17:15 and 23:15 Pakistan). In the dashboard's Social page, check the timestamp and connection message after a run.
18. Match campaign keys on orders to `meta:CAMPAIGN_ID`. Only orders with known attribution contribute to that campaign's collected revenue and ROAS. An API campaign day cannot silently overwrite an owner's manual/CSV record; reconcile any reported conflict.
19. Review the most recent seven days of campaign spend against Ads Manager. The current bounded sync supports up to 100 campaign-day records per run. If Meta returns more, use CSV until paginated sync is added. Do not also record the same ad spend as an expense or direct order cost.

## What appears, and what can be unavailable

- Instagram: followers, media count, recent posts/Reels, likes, comments, and supported views/reach/saves/shares. Engagement = (likes + comments + saves + shares) ÷ reach × 100 when every input exists.
- Account reach/views/profile metrics are requested where supported. Meta can reject deprecated or account-ineligible metrics. Those remain unavailable, never zero. The last successful cache remains available after a later API failure.
- Ads: daily campaign spend, impressions and clicks feed Finance. CPC = spend ÷ clicks; CPM = spend ÷ impressions × 1,000; ROAS = attributed **delivered and collected** revenue ÷ spend. Provider action results are cached separately and are not treated as VOSS sales.
- Reach is unique people. Do not add daily reach values to claim a weekly unique total.
- The existing inbox connector has its own server permission setup. Metrics authorization does not automatically enable Facebook/Instagram messages, comments moderation or WhatsApp.

## Expiry and reconnecting

Do not assume a Facebook-login token can refresh forever without a person reauthorizing. The safer implementation checks the connection on its schedule and shows a reconnect/permission warning when needed. Replace a revoked/expired token in Cloudflare Secrets, rerun the check and verify the timestamp. An automatic token exchange that depends on an app secret is not enabled without that app's credentials and a verified renewal flow.

## Primary documentation

- [Meta Instagram platform](https://developers.facebook.com/docs/instagram-platform/)
- [Instagram API with Facebook Login insights](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/)
- [Meta Marketing API Insights](https://developers.facebook.com/docs/marketing-api/insights/)
- [Meta's Marketing API collection and access setup](https://www.postman.com/meta/facebook-marketing-api/collection/0zr4mes/facebook-marketing-api-mapi)
- [Long-lived Facebook access tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/)
- [Cloudflare Cron Triggers use UTC](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

Meta permissions, review rules and metric names change. Use the app dashboard's currently supported Graph version and review its available permissions before authorizing production access.

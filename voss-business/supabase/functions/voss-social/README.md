# Read-only Meta connection

This function uses Instagram API **with Facebook Login**, through a Page access token and `graph.facebook.com`. It does not use the separate Instagram Login API or its `instagram_business_*` permissions. It supports Facebook Pages and Instagram professional accounts linked to a Page. WhatsApp is not implemented.

Every data request verifies its caller using Supabase Auth `getUser(jwt)`, requires a verified email, then calls `voss_business_access` using the same JWT and accepts only approved `owner` or `technical` roles. There is no service-role client. Deploy with gateway `verify_jwt=false` for modern publishable keys; the function performs user JWT verification itself. Anonymous callers still receive 401 and unapproved users 403 before any provider configuration is inspected.

## Server secrets

Configure in Supabase Edge Function secrets, never in a frontend environment, Git file or request body:

- `META_PAGE_ACCESS_TOKEN`: Page access token with the permissions below, obtained from an identity with the corresponding Page tasks.
- `META_GRAPH_VERSION`: exact active version selected for the Meta app, such as the `vNN.0` format shown in its dashboard. There is deliberately no default version.
- `META_FACEBOOK_PAGE_ID`: numeric Facebook Page ID.
- `META_INSTAGRAM_ACCOUNT_ID`: numeric ID of the professional Instagram account linked to that Page, not its username.

Supabase supplies `SUPABASE_URL` and `SUPABASE_ANON_KEY`; `SUPABASE_PUBLISHABLE_KEY` is supported as an alternative key. Configure both account IDs for Instagram conversations. Missing configuration returns a real disconnected state after authorization, without fabricated metrics. A configured token alone never proves connectivity; `status` reads the actual account, and feature permissions are checked through their respective reads.

## Meta setup and access

1. Create or select a Meta business app. The business must control the Facebook Page and linked Instagram Business or Creator account. A personal Instagram account is unsupported by this API configuration.
2. Use Facebook Login for Business / Meta's supported token flow to grant permissions and obtain the Page access token. `pages_show_list` is used during Page discovery/token setup. Do not put the user token or Page token into browser source.
3. Request only the relevant feature permissions and Page tasks. Page post reads need `pages_read_engagement`; reading user-authored Facebook comments requires `pages_read_user_content`. Instagram media reads need `instagram_basic` and `pages_read_engagement`; media insights need `instagram_manage_insights`; Instagram comments need `instagram_manage_comments`. Messenger conversation reads require `pages_messaging`, `pages_read_engagement` and `pages_manage_metadata`; Instagram conversation reads require `instagram_basic`, `instagram_manage_messages` and `pages_manage_metadata`. The Page token's granting identity must have the relevant `MESSAGING` or `MODERATE` task, as documented for that platform.
4. Test with properly assigned app/account roles in development. Standard Access does not imply access to customer conversations. Meta's Conversations API requires Advanced Access for conversations with people who do not have an app/account/business role; its Instagram Messaging requirements include a verified business. Complete applicable App Review, business verification and Live-mode requirements before expecting production customer messages. This code cannot grant those permissions or bypass review.
5. Set secrets and deploy `voss-social` with `verify_jwt=false`. Verify `status` as an approved owner, then verify each needed feature separately. Expired/revoked tokens and missing permissions return unavailable messages; empty arrays represent only what Meta returned within the documented window.

No `pages_manage_posts`, content publishing, message sends, comment replies, moderation writes, webhooks, unread counts or WhatsApp access are implemented. Sending capabilities are not required by this dashboard.

## Read contract and limits

POST JSON `{ "action": "status" | "posts" | "conversations" | "comments", "platform": "all" | "facebook" | "instagram", "post_id"?: "provider-id" }`. Comments require one platform and a post from the configured account's latest 50 posts. The function never follows user URLs or Meta pagination URLs, uses only fixed Graph API GET requests, rejects redirects, bounds response/request sizes and applies 12-second fetch timeouts plus a 14-second shared provider deadline.

Posts return up to six recent posts per account, with nullable metrics. Instagram insights request `views,reach,saved,shares` once per media; unsupported combinations or missing permissions leave those values null with an explanation. Facebook currently returns reactions, comments and shares; views, reach and saves stay null. Engagement is calculated only with all interactions and positive reach. Unique reach across posts is not an additive total. Recent conversation reads return up to twelve conversations and five messages per conversation, without attachment URLs or email addresses. Comments return up to 25 entries. No provider data is cached across requests or written to disk.

## Primary documentation checked

- [Meta Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) documents Facebook Login, professional-account/Page linkage, token acquisition and the distinct Instagram Login configuration.
- [Meta Conversations API collection](https://www.postman.com/meta/messenger-platform-api/folder/22794852-255610cd-47f5-4f4d-b3fa-71aec360be9a) documents Page tokens, Page tasks, permissions, Advanced Access and business verification.
- [Instagram insights reference](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/), [comment moderation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/comment-moderation/) and [Pages posts](https://developers.facebook.com/docs/pages-api/posts/) are the canonical references. Meta's developer pages were inaccessible/rate limited during implementation; the official Meta Postman collections were accessible. Verify active-version metric availability and permission requirements in the Meta dashboard when configuring the app. There is no claim of a live connected account until those credentials are supplied and verified.

Run `node scripts/test-social.mjs` for isolated mocked checks. These tests never contact Meta or the live Supabase project.

# Keyword Cannibalization Report

One primary page per intent. Based on the pages that exist after this change.

| Intent cluster | Primary page | Risk / rule |
|---|---|---|
| Brand (MyLoginn, MyLoginn Tech, myloginn.com) | `/` | `/about` supports; do not target brand terms on service pages |
| Web / mobile / software development | `/services/app-web-development` | One page covers three related intents today. Split into `/web-development` and `/mobile-app-development` only when each has distinct content |
| AI development, AI agents, agentic AI, gen AI services | `/services/ai-development` | Keep "Generative AI course" intent on `/courses/gen-ai-get-ready-for-future`, not here |
| Testing / automation testing / Playwright services | `/services/testing-automation` | Playwright *course* intent belongs to a future course page |
| Digital marketing + SEO | `/services/digital-marketing` | Do not create a second SEO page until it has distinct content |
| Courses | `/courses` (hub), `/courses/<slug>` | Hub targets "technology courses"; slugs target single technology |
| Local "Coimbatore" terms | Previously every service page. Now only body copy; reserve a single future `/locations/coimbatore` | Prevents 4 pages competing for "company Coimbatore" |

Typos (MyLogin, My Login) are **not** given pages. The only legitimate alias in schema is "My Loginn".

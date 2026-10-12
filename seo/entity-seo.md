# Entity SEO

**Entity:** MyLoginn Tech Private Limited (brand MyLoginn, myloginn.com). `@id` = `https://www.myloginn.com/#organization`, referenced by WebSite and by each Service's `provider`.

**Problem found:** a web search for "myloginn" returns only "MyLogin" (school SSO, LAUSD, a Minecraft plugin). MyLogin was previously declared an alias in schema; removed. Allowed aliases: "My Loginn", "MyLoginn Tech".

**Disambiguation done:** homepage title/description state "technology company"; `llms.txt` states MyLoginn is unrelated to MyLogin and has two n's.

**Entity signals still missing (owner action; only genuine profiles):**
- LinkedIn company page, GitHub org, YouTube, Google Business Profile (if eligible) → add to `sameAs` once they exist and link back to myloginn.com. Currently only Instagram (`myloginntech`).
- Directory profiles (Clutch, GoodFirms, DesignRush, YourStory) with identical name/description.
- Publish the legal details actually held (CIN, registered address) on About/Contact; do not add unless real.
- Google site name: homepage WebSite schema `name: "MyLoginn"` is in place.

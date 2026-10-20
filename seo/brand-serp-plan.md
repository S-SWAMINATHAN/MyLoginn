# Brand SERP Plan: make myloginn.com the first, structured result for its own name

## Variant classification (full list in keyword-map.csv, clusters `brand-target`, `brand-typo`, `mismatch-other-entity`)
| Group | Examples | Refers to | Action |
|---|---|---|---|
| Target | myloginn, my loginn, myloginn tech, myloginn tech private limited, myloginn.com, myloginn coimbatore | MyLoginn | Win #1 + sitelinks |
| Keyboard typos | myloginm, mylogginn, mylooginn, nyloginn | MyLoginn | Correct spelling everywhere; engines auto-correct |
| Ambiguous / other | mylogin, my login, mylogin tech, login tech | Other products/companies | **Not targeted.** Google may show the other product first, and that is correct for people looking for it |

## Why "mylogin" and "my login" will not be ours
Those words belong to an established product (MyLogin by Wonde, trusted by 30,000+ schools). Claiming them in schema or stuffing them into pages would mislead searchers and risks spam treatment. The honest route is the visible disambiguation FAQ added to About ("Is MyLoginn the same as MyLogin?").

## Why Google rewrites "myloginn"
Google auto-corrected `myloginn` to `mylogin` and `myloginn tech` to `login tech` in tests on 2026-10-12/13. That is query-popularity based; no code can switch it off. It reverses as real people search and click the exact spelling.

## Structured result (sitelinks, site name, logo)
Sitelinks are chosen by Google and cannot be forced. Eligibility is in place or in progress:
- Site name + logo: WebSite schema name "MyLoginn", favicon present (confirmed showing in Google).
- Clear nav and descriptive link text to Services, AI Development, Testing, Digital Marketing, Courses, Projects, About, Contact.
- Unique titles and descriptions per page; Organization schema with service catalog and disambiguation.
- Missing: verified third-party profiles in `sameAs` (LinkedIn, YouTube, GitHub, Facebook, GBP), real reviews, more brand searches.

## Fastest legitimate way to be literally first today: Google Ads on brand terms
Run a small Search campaign on exact/phrase `myloginn`, `my loginn`, `myloginn tech`, `myloginn tech private limited`, with Sitelink assets (Services, Courses, Internships, Contact) and the negatives in `negative-keywords.csv`. Brand clicks are cheap. This puts the company first as a sponsored result; organic position is built separately.

## Checklist
1. Deploy and request indexing of `/`, `/about`, service pages (Search Console).
2. Create/verify LinkedIn, YouTube, GitHub, Facebook, Google Business Profile; add to `sameAs`.
3. Ask students/clients to search "MyLoginn Tech" and follow your profile links.
4. Use exactly "MyLoginn Tech" in bios, certificates, email signatures, and press.
5. Re-test these queries weekly: myloginn, my loginn, myloginn tech, myloginn.com, MyLoginn Tech.

## Files (updated 2026-10-13)
- `brand-variants.csv`: 2,445 systematically generated spellings of the brand (prefix x spacing x core x suffix), each classified TARGET_BRAND, BRAND_VARIANT, OUR_TYPO, AMBIGUOUS or OTHER_ENTITY, with the action to take.
- `negative-keywords.csv`: brand-related only (1,199): MyLogin and similar-name intents plus every AMBIGUOUS and OTHER_ENTITY spelling as **exact** match. Spellings that mean MyLoginn are never negated.
- `negative-keywords-general.csv`: 2,262 broader negatives (other sites' logins, job seekers, piracy, unrelated verticals) for Ads hygiene. Optional.
- Classification rule: `myloginn` (double n) = ours; `mylogin`/`my login` = other product; a misspelled middle with a single final n is AMBIGUOUS (watch Search Console to see which it really is).

# Manual Google and Vercel Checklist - 2026-11-06

## Vercel

- Deploy this feature branch to preview only.
- Confirm that canonical tags remain `https://www.myloginn.com/...` on preview URLs.
- Confirm `/sitemap.xml` and `/robots.txt` use the canonical host.
- Confirm public representative routes return 200 and private routes remain protected.
- Confirm there are no broken assets, hydration errors, or unexpected auth changes.
- Promote only after review and explicit approval.

## Google Search Console

- Add the canonical property.
- Verify ownership.
- Submit `https://www.myloginn.com/sitemap.xml`.
- Inspect homepage, services, projects, contact, careers, internship, course, and Tamil Nadu routes.
- Review index coverage after crawling.

## Bing Webmaster Tools

- Add and verify the canonical domain.
- Submit the sitemap.
- Request crawling for important public routes.

## Analytics

- Provide an approved GA4 measurement ID or add it through the existing approved configuration path.
- Test `phone_click`, `whatsapp_click`, and `email_click`.
- Test lead/form events only on public forms.
- Confirm consent behavior where required by law.

## Google Business Profile

- Claim or verify the existing business listing.
- Use only the verified business category and service area.
- Add Udumalpet, Tamil Nadu, India consistently if supported.
- Add `https://www.myloginn.com` after ownership verification.

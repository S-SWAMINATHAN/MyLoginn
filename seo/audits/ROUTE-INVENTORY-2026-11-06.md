# Public Route Inventory - 2026-11-06

## Indexable marketing and company routes

| Route | Purpose | Sitemap |
|---|---|---|
| `/` | Company homepage | Yes |
| `/about` | Company information | Yes |
| `/contact` | Enquiries and contact information | Yes |
| `/services` | Services overview | Yes |
| `/services/app-web-development` | App and web development | Yes |
| `/services/ai-development` | AI development and automation | Yes |
| `/services/digital-marketing` | Digital marketing | Yes |
| `/services/testing-automation` | Software testing | Yes |
| `/projects` | Public project index | Yes |
| `/projects/[slug]` | Public project detail and database showcase routes | Dynamic eligibility |
| `/careers` | Public careers index | Yes |
| `/internships` | Public internship index | Yes |
| `/internships/[slug]` | Public internship detail | Eligible non-draft records |
| `/locations/tamil-nadu` | Verified local-company information | Yes |
| `/courses` | Public course index | Yes |
| `/courses/[slug]` | Published course detail | Published only |
| `/logiquest` and learning routes | Public learning platform | Yes, subject to implemented eligibility |
| `/practice`, including public practice landing routes | Public practice area | Selected routes |
| `/privacy` | Privacy policy | Yes |
| `/terms` | Terms of service | Yes |

## Non-indexable private or utility routes

- `/admin/**`
- `/api/**`
- `/dashboard/**`
- `/login`, `/signup`, `/profile`
- `/reset-password`
- `/certificate/**`
- Course checkout and certificate-download routes
- Protected learning session, assessment, report, and private activity routes
- Developer previews and certificate previews

## Switched-off routes

- Astrology and tutoring routes can return 404 when disabled and should remain absent from indexable navigation and sitemap output.

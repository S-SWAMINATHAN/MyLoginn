import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "http-https-dns-and-apis", title: "HTTP, HTTPS, DNS and APIs", category: "Networking", track: "essential-it-skills", level: "Beginner", weeks: 2,
  description: "Understand what happens when you open a website: DNS lookups, HTTP requests and responses, methods, status codes, cookies, HTTPS and TLS certificates, and how REST APIs and JSON let applications talk to each other.",
  audience: "Web developers, testers, DevOps and support learners who want to understand the web at the protocol level.",
  prereq: "Networking Fundamentals is helpful.",
  objectives: ["Explain the steps from typing a URL to seeing a page", "Describe how DNS resolves names and the main record types", "Read HTTP requests and responses including methods, headers and status codes", "Explain cookies, sessions and caching", "Explain how HTTPS and TLS protect traffic and what a certificate proves", "Describe REST APIs, JSON and common authentication methods"],
  tags: ["HTTP", "HTTPS", "DNS", "REST", "TLS", "APIs"], prerequisiteSlugs: ["networking-fundamentals"], relatedSlugs: ["networking-fundamentals", "api-testing-with-postman"],
  modules: [
    { title: "From URL to Page", lessons: [
      L("What happens when you open a website", 13,
`## The journey in eight steps

You type \`https://www.example.com/products\` and press Enter.

1. **Parse the URL:** scheme (https), host (www.example.com), path (/products).
2. **Check the cache:** the browser may already know the IP address or have a cached copy.
3. **DNS lookup:** translate the host name into an IP address.
4. **TCP connection:** open a connection to that IP on port 443.
5. **TLS handshake:** agree on encryption and verify the server's certificate.
6. **HTTP request:** send \`GET /products\`.
7. **HTTP response:** the server returns a status code, headers and HTML.
8. **Render:** the browser parses HTML, fetches CSS, JavaScript and images (more requests) and draws the page.

## Anatomy of a URL

\`\`\`
https://www.example.com:443/products/shoes?color=red&size=9#reviews
\\___/   \\_____________/ \\_/ \\____________/ \\______________/ \\_____/
scheme       host        port      path           query        fragment
\`\`\`

The **fragment** (after #) is used only by the browser and is not sent to the server.

## Client and server

The **client** (browser, mobile app) sends requests; the **server** listens and responds. A single page may involve many servers: the website, a CDN for images, an analytics service and an API.

## Seeing it yourself

Open your browser's **Developer Tools, Network tab**, reload a page and watch every request, its status, size and timing. You can also run \`curl -v https://example.com\` to see the request and response headers.

## Practice

Use the Network tab on a news site and count how many requests the home page makes and which domain served the most.`,
        [q("Which step translates a host name into an IP address?", ["TLS handshake", "DNS lookup", "Rendering", "TCP close"], 1, "DNS resolves names to addresses."), q("The part of a URL after # is:", ["Sent to the server always", "Used only by the browser", "The port", "The scheme"], 1, "Fragments stay in the browser."), q("Which tool in the browser shows every request a page makes?", ["The Network tab in Developer Tools", "The bookmarks bar", "The history list", "The printer dialog"], 0, "Developer Tools, Network tab.")],
        ["Opening a page involves DNS, a connection, a secure handshake, a request and a response.", "Like calling a shop: look up the number, dial, check it is the real shop, ask, listen.", [["Find", "DNS lookup", "Name to IP"], ["Connect", "TCP and TLS", "Port 443, encrypted"], ["Ask", "HTTP request and response", "Then render the page"]], "Every page load is a chain of small network steps.", ["DNS then TCP then TLS then HTTP", "One page, many requests", "Use the Network tab"], "Thinking a web page is one single download."]),
      L("DNS: how names become addresses", 15,
`## What DNS does

The **Domain Name System** is the Internet's phonebook: it maps names (\`example.com\`) to IP addresses (\`93.184.216.34\`) and holds other information such as mail servers.

## The hierarchy

\`www.example.com.\` is read right to left: **root (.)**, **top-level domain (com)**, **second-level domain (example)**, **subdomain (www)**.

## Resolution

1. The browser and OS check their **caches**.
2. The OS asks a **recursive resolver** (your ISP's, or 8.8.8.8, 1.1.1.1).
3. If not cached, the resolver asks a **root server**, which points to the **TLD server** (.com), which points to the domain's **authoritative name server**.
4. The authoritative server returns the answer, and the resolver caches it for the **TTL** (time to live).

## Common record types

| Record | Meaning | Example |
|---|---|---|
| **A** | Name to IPv4 | example.com -> 93.184.216.34 |
| **AAAA** | Name to IPv6 | example.com -> 2606:2800:... |
| **CNAME** | Alias to another name | www -> example.com |
| **MX** | Mail servers for the domain | 10 mail.example.com |
| **TXT** | Free text, used for SPF, DKIM, verification | v=spf1 ... |
| **NS** | Authoritative name servers | ns1.provider.com |

## TTL and propagation

A **TTL** of 3600 means resolvers may keep an answer for one hour. After you change a record, old answers stay in caches until the TTL expires. This is why changes seem to "propagate" slowly. Lower the TTL **before** a planned migration.

## Tools

\`nslookup example.com\`, \`dig example.com A\`, \`dig MX example.com\`. Online tools can check records from several locations.

## Practice

Run \`nslookup\` or \`dig\` on a site you use and note the A record, the TTL and its name servers.`,
        [q("Which record type maps a name to an IPv4 address?", ["A", "MX", "TXT", "NS"], 0, "An A record holds an IPv4 address."), q("What does TTL control?", ["How long a DNS answer may be cached", "The page colour", "Password strength", "Server speed"], 0, "TTL is the cache lifetime of a record."), q("Which record lists a domain's mail servers?", ["A", "CNAME", "MX", "AAAA"], 2, "MX records point to mail servers.")],
        ["DNS turns names into addresses through caches, resolvers and authoritative servers.", "Like asking directory enquiries, which asks the town office when it does not know.", [["Ask", "Recursive resolver", "Checks caches first"], ["Walk", "Root, TLD, authoritative", "Follows the hierarchy"], ["Cache", "TTL", "Why changes take time"]], "Lower the TTL before changing records you depend on.", ["A and AAAA map to IPs", "CNAME is an alias", "TTL drives propagation delay"], "Changing DNS records and expecting everyone to see them instantly."]),
      L("HTTP requests, responses and cookies", 16,
`## A simple conversation

HTTP is a **text-based request and response protocol** carried over TCP (HTTP/1.1) or QUIC (HTTP/3).

\`\`\`
GET /products?color=red HTTP/1.1
Host: www.example.com
Accept: text/html
User-Agent: Mozilla/5.0
Cookie: session=abc123
\`\`\`

\`\`\`
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 5120
Cache-Control: max-age=3600
Set-Cookie: session=abc123; HttpOnly; Secure

<html> ... </html>
\`\`\`

## Methods and statuses

GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes. Status classes: **2xx** success, **3xx** redirect, **4xx** client error, **5xx** server error. Frequent ones: 200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 429, 500, 502, 503.

## Statelessness and cookies

HTTP is **stateless**: each request is independent. To remember a user, the server sets a **cookie**; the browser sends it back on later requests. A login typically creates a **session ID** stored in a cookie while the data stays on the server.

Important cookie flags:

- **HttpOnly:** JavaScript cannot read it (limits theft by cross-site scripting).
- **Secure:** sent only over HTTPS.
- **SameSite:** limits sending on cross-site requests (helps against CSRF).
- **Expires / Max-Age:** lifetime.

## Caching

\`Cache-Control: max-age=3600\` lets the browser reuse a response for an hour. **ETag** and **Last-Modified** let the browser ask "has it changed?" and receive a lightweight **304 Not Modified**.

## HTTP versions

HTTP/1.1 (one request at a time per connection), HTTP/2 (multiplexing many requests on one connection), HTTP/3 (over QUIC, faster recovery from packet loss).

## Practice

In the Network tab, open one request and identify its method, status, a request header, a response header and whether it came from the cache.`,
        [q("Why is HTTP described as stateless?", ["Each request is independent, so cookies or tokens keep state", "It has no methods", "It never uses headers", "It cannot send bodies"], 0, "The protocol does not remember earlier requests."), q("Which cookie flag stops JavaScript from reading a cookie?", ["Secure", "HttpOnly", "SameSite", "Max-Age"], 1, "HttpOnly hides the cookie from scripts."), q("A 304 status means:", ["Not Modified: use your cached copy", "Not found", "Server error", "Created"], 0, "The cached version is still valid.")],
        ["HTTP is a request and response conversation, made stateful with cookies and faster with caching.", "Like ordering at a counter: each order is separate unless you show your membership card.", [["Request", "Method, headers, body", "What the client asks"], ["Response", "Status, headers, body", "What the server returns"], ["State", "Cookies and sessions", "HttpOnly, Secure, SameSite"]], "Cookies and caching are controlled entirely by headers.", ["HTTP is stateless", "Protect cookies with flags", "ETags save bandwidth"], "Storing sensitive data in a cookie without HttpOnly and Secure."]),
    ] },
    { title: "Security and APIs", lessons: [
      L("HTTPS, TLS and certificates", 15,
`## Why HTTPS

Plain HTTP sends everything in readable text. Anyone on the path (café Wi-Fi, a rogue router) could **read or change** it. **HTTPS** is HTTP inside **TLS (Transport Layer Security)**, giving three protections:

1. **Confidentiality:** the traffic is encrypted.
2. **Integrity:** tampering is detected.
3. **Authentication:** you are talking to the real server.

## The TLS handshake (simplified)

1. The client says hello and lists the encryption it supports.
2. The server replies with its choice and its **certificate**.
3. The client **verifies the certificate** (trusted issuer, matching name, not expired).
4. Both sides agree on **session keys** using key exchange (such as ECDHE).
5. Data is then encrypted with a fast **symmetric** key.

## Certificates

A **certificate** binds a domain name to a **public key** and is **signed by a Certificate Authority (CA)** that browsers trust. Let's Encrypt offers free automated certificates. Types: **DV** (domain validated), **OV** and **EV** (organisation validated). A certificate proves control of the domain; it does **not** prove the site is honest.

## Common certificate errors

| Browser message | Cause |
|---|---|
| Certificate expired | Not renewed in time |
| Name mismatch | Certificate for a different domain |
| Untrusted issuer | Self-signed or unknown CA |
| Mixed content | HTTPS page loads HTTP resources |

## HSTS

The **Strict-Transport-Security** header tells browsers to use HTTPS only for the domain.

## Practice

Open the padlock details on your bank's or your college's site and note the issuer, the domain names and the expiry date.`,
        [q("Which protection does TLS NOT provide by itself?", ["Encryption of traffic", "Detection of tampering", "A guarantee that the website owner is honest", "Server authentication"], 2, "A certificate shows who controls the domain, not that they are trustworthy."), q("A certificate is signed by:", ["A Certificate Authority", "The browser vendor's intern", "Any user", "The router"], 0, "CAs vouch for the domain-to-key binding."), q("Mixed content means:", ["An HTTPS page loading HTTP resources", "A page in two languages", "A cached page", "A redirected page"], 0, "Insecure resources weaken the secure page.")],
        ["HTTPS wraps HTTP in TLS so traffic is private, unaltered and from the right server.", "Like a sealed, signed envelope delivered by a verified courier.", [["Encrypt", "Session keys", "Confidentiality"], ["Verify", "Certificate and CA", "Authentication"], ["Protect", "Integrity checks", "Tampering is detected"]], "Always use HTTPS and renew certificates before they expire.", ["TLS gives confidentiality, integrity and authentication", "CAs sign certificates", "Expired certificates break trust"], "Letting a certificate expire and taking the site down."]),
      L("REST APIs, JSON and authentication", 16,
`## What an API is

An **API** lets programs talk to each other. A **REST** API exposes **resources** at URLs and uses HTTP methods to act on them.

| Action | Request | Typical response |
|---|---|---|
| List products | \`GET /products\` | 200 with a JSON array |
| Get one | \`GET /products/42\` | 200, or 404 if missing |
| Create | \`POST /products\` with JSON | 201 Created |
| Replace | \`PUT /products/42\` | 200 or 204 |
| Update part | \`PATCH /products/42\` | 200 |
| Delete | \`DELETE /products/42\` | 204 No Content |

## JSON

\`\`\`json
{ "id": 42, "name": "Notebook", "price": 120.5, "tags": ["paper", "a5"], "inStock": true }
\`\`\`

## Design habits of good REST APIs

- **Nouns in URLs** (\`/orders\`), not verbs (\`/getOrders\`).
- **Correct status codes** and a **consistent error format**.
- **Pagination** (\`?page=2&limit=20\`), **filtering** and **sorting**.
- **Versioning** (\`/v1/orders\`).
- **Idempotent** PUT and DELETE, so retries are safe.

## Authentication and authorisation

- **API keys:** simple identifiers sent in a header; fine for low-risk use.
- **Basic auth:** username and password in a header; only over HTTPS.
- **Bearer tokens (JWT):** a signed token in \`Authorization: Bearer <token>\`.
- **OAuth 2.0:** delegated access ("Sign in with Google"), producing access tokens.

**Authentication** asks *who are you?*; **authorisation** asks *what may you do?*

## Rate limiting and errors

APIs limit requests (429 Too Many Requests, with a **Retry-After** header). Clients should **retry with back-off**.

## Practice

Design the URLs, methods and expected status codes for an API that manages a library's books and members.`,
        [q("Which URL follows REST naming habits?", ["/getAllOrders", "/orders", "/doOrder", "/order-list-all"], 1, "REST uses nouns for resources and HTTP methods for actions."), q("What status does a successful DELETE usually return with no body?", ["204", "201", "301", "404"], 0, "204 means success with no content."), q("Authorisation answers:", ["Who are you?", "What are you allowed to do?", "Where are you?", "When did you log in?"], 1, "Authentication identifies; authorisation permits.")],
        ["REST APIs expose resources at URLs and use HTTP methods and JSON, protected by tokens.", "Like a library desk: the nouns are the shelves, the verbs are borrow, return and reserve.", [["Resources", "Nouns in URLs", "/orders/42"], ["Actions", "GET, POST, PUT, DELETE", "Right status codes"], ["Access", "Tokens and OAuth", "Authenticate then authorise"]], "Consistent design and strong authentication make APIs easy and safe to use.", ["Use nouns and methods", "Return correct codes", "Never send credentials over HTTP"], "Putting verbs in URLs and returning 200 for every error."]),
      { ...L("Challenge: parse a URL", 12,
`## Your task

Reading URLs is a daily skill for developers and testers. Write a small program that splits a URL into its parts.

## Input and output

Read one URL of the form \`scheme://host/path\` (the path may be empty and there is no query). Print two lines:

1. \`scheme: <the scheme>\`
2. \`host: <the host>\`

Use string operations (such as split) and check that \`https://www.example.com/products\` gives scheme https and host www.example.com.`,
        [q("In https://www.example.com/a, the scheme is:", ["https", "www", "example", "com"], 0, "The scheme precedes ://."), q("The host in https://api.test.dev/v1/x is:", ["api.test.dev", "v1", "https", "x"], 0, "The host is between :// and the first slash."), q("The path in https://a.com/x/y is:", ["/x/y", "a.com", "https", "y only"], 0, "The path starts at the first slash after the host.")],
        ["A URL splits into scheme, host, port, path, query and fragment.", "Like an address: country, city, street.", [["Scheme", "Before ://", "https or http"], ["Host", "Between :// and /", "Server name"], ["Path", "After the host", "Resource location"]], "Splitting on :// and / separates the main parts.", ["split('://') gives scheme and rest", "split('/') separates host from path", "Handle an empty path"], "Forgetting URLs with no path after the host."]),
        challenge: pyChallenge("Parse a URL", "Read one URL in the form scheme://host/path (the path may be missing). Print two lines: 'scheme: <scheme>' and 'host: <host>'.", "url = input()\n# split into scheme and host\n",
          [{ input: "https://www.example.com/products", expected: "scheme: https\nhost: www.example.com" }, { input: "http://localhost", expected: "scheme: http\nhost: localhost" }, { input: "https://api.test.dev/v1/users/7", expected: "scheme: https\nhost: api.test.dev", hidden: true }],
          ["Split once on '://' to get the scheme and the rest.", "Split the rest on '/' and take the first part as the host.", "Print two lines with print()."],
          "url = input()\nscheme, rest = url.split('://', 1)\nhost = rest.split('/', 1)[0]\nprint('scheme: ' + scheme)\nprint('host: ' + host)",
          "Split on :// to separate the scheme, then split the remainder on the first / to isolate the host.") },
    ] },
  ],
  final: [
    q("Which step maps a domain name to an IP address?", ["DNS lookup", "TLS handshake", "Rendering", "Caching"], 0, "DNS."),
    q("In a URL the fragment after # is:", ["Used only by the browser", "Always sent to the server", "The port", "The scheme"], 0, "Not sent."),
    q("An A record maps:", ["A name to an IPv4 address", "A mail server", "A text note", "An alias"], 0, "IPv4."),
    q("A CNAME record is:", ["An alias to another name", "An IPv6 address", "A mail server", "A certificate"], 0, "Canonical name alias."),
    q("TTL is:", ["How long an answer may be cached", "A password", "A port", "A header only for images"], 0, "Time to live."),
    q("HTTP is stateless meaning:", ["Each request is independent", "It has no status codes", "It cannot use cookies", "It never changes"], 0, "No built-in memory."),
    q("HttpOnly on a cookie:", ["Hides it from JavaScript", "Forces mobile use", "Disables caching", "Makes it longer"], 0, "Reduces XSS theft."),
    q("A 304 response means:", ["Not Modified", "Created", "Forbidden", "Server error"], 0, "Use the cache."),
    q("TLS provides: (select all that apply)", ["Encryption", "Integrity", "Server authentication", "A guarantee the owner is honest"], [0, 1, 2], "Not a guarantee of honesty."),
    q("A certificate is signed by:", ["A Certificate Authority", "The user", "The DNS server", "The router"], 0, "A trusted CA."),
    q("Mixed content is:", ["HTTP resources on an HTTPS page", "Two languages", "A redirect", "A cache hit"], 0, "A security weakness."),
    q("Which REST URL is best?", ["/orders", "/getOrders", "/orderGetAll", "/do/orders"], 0, "Nouns."),
    q("Successful DELETE commonly returns:", ["204", "500", "301", "401"], 0, "No content."),
    q("401 versus 403: 'authenticated but not allowed' is:", ["403", "401", "404", "502"], 0, "Forbidden."),
    q("Which header sends a bearer token?", ["Authorization", "Accept", "Cache-Control", "Host"], 0, "Authorization: Bearer ..."),
  ],
  project: { title: "Capstone: trace a page load", brief: "Pick a website. Use dig/nslookup and the browser Network tab to document its A and MX records, TTL, the TLS certificate issuer and expiry, the first five requests with methods and statuses, its caching headers and cookie flags, and one JSON API call the page makes." },
});

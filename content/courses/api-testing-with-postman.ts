import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "api-testing-with-postman", title: "API Testing with Postman", category: "Software Testing", track: "software-testing", level: "Beginner", weeks: 3,
  description: "Learn to test REST APIs with Postman: requests, methods, status codes, headers, authentication, variables and environments, test scripts with pm.test, collections, the Collection Runner and Newman.",
  audience: "Manual testers moving into API testing, junior QA engineers and developers who want to verify their endpoints.",
  prereq: "Basic understanding of web applications. No programming needed for most of the course.",
  objectives: ["Explain HTTP methods, status codes, headers and JSON bodies", "Send requests and read responses in Postman", "Use environments and variables instead of hard-coded values", "Write automated checks with pm.test and pm.expect", "Chain requests by saving data from one response for the next", "Run collections with the Collection Runner and Newman"],
  tags: ["Postman", "API Testing", "REST", "JSON", "Newman"], relatedSlugs: ["software-testing-fundamentals", "manual-testing"],
  modules: [
    { title: "API and HTTP Basics", summary: "What you are actually testing.", lessons: [
      L("What an API is and why test it", 12,
`## APIs in plain words

An **API (Application Programming Interface)** is a contract that lets one piece of software ask another to do something. A mobile app does not read the database directly: it sends a **request** to the server's API and receives a **response**.

## REST APIs

Most web APIs are **REST** style: resources identified by URLs, accessed with standard HTTP methods, usually exchanging **JSON**.

\`\`\`
GET https://jsonplaceholder.typicode.com/posts/1
\`\`\`

returns a JSON document describing post number 1.

## Why test at the API level

- **Faster than UI tests** and far more stable.
- **Earlier:** APIs exist before the screens are finished.
- **Deeper:** you can send inputs the UI would never allow and see how the server reacts.
- **Wider coverage:** one API serves web, mobile and partners.

## What to verify

1. **Status code:** correct success or error code.
2. **Response body:** the right fields, types and values.
3. **Headers:** content type, caching, security headers.
4. **Performance:** response time within the target.
5. **Error handling:** helpful messages, no sensitive internals.
6. **Security and permissions:** only authorised users can access data.

## Practice APIs (safe and legal)

Use public practice services such as **JSONPlaceholder** (https://jsonplaceholder.typicode.com) and **ReqRes** for learning. Never test APIs you do not own or have permission to test.

## Practice

Name three things you would check about a "get product by ID" endpoint beyond the product name.`,
        [q("Why are API tests usually more stable than UI tests?", ["They avoid screens and layout changes", "They are slower", "They need no data", "They cannot fail"], 0, "API tests do not depend on page layout or timing in the browser."), q("Which is a good, legal API to practise on?", ["Any bank's private API", "A public practice API such as JSONPlaceholder", "A competitor's production API", "A government database"], 1, "Only test APIs you own or that are explicitly offered for practice."), q("What does REST commonly use to represent data?", ["JSON", "Only images", "Only Word files", "Only audio"], 0, "REST APIs most often exchange JSON.")],
        ["An API lets software talk to software, and testing it checks the contract directly without a screen.", "Like ordering from a menu: the waiter (API) takes your request to the kitchen and brings back the result.", [["Request", "Method, URL, headers, body", "What you send"], ["Response", "Status, headers, body", "What comes back"], ["Verify", "Correctness and speed", "Codes, fields, errors"]], "API testing is fast, early and thorough.", ["Test below the UI", "Check status, body, headers and time", "Use only APIs you may test"], "Testing a live production API you do not have permission to test."]),
      L("HTTP methods, status codes and headers", 15,
`## Methods (verbs)

| Method | Purpose | Safe? | Idempotent? |
|---|---|---|---|
| **GET** | Read a resource | Yes | Yes |
| **POST** | Create a resource | No | No |
| **PUT** | Replace a resource | No | Yes |
| **PATCH** | Change part of a resource | No | Usually |
| **DELETE** | Remove a resource | No | Yes |

*Safe* means it does not change data. *Idempotent* means repeating it has the same effect as doing it once.

## Status codes

| Range | Meaning | Examples |
|---|---|---|
| **2xx** success | Request worked | 200 OK, 201 Created, 204 No Content |
| **3xx** redirect | Look elsewhere | 301, 302, 304 Not Modified |
| **4xx** client error | The request is wrong | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests |
| **5xx** server error | The server failed | 500 Internal Server Error, 502, 503, 504 |

A good API returns **precise codes**: 201 for a created resource, 400 or 422 for invalid input, 404 for a missing item. Returning 200 with an error message inside is poor design.

## Headers

Headers carry metadata:

- **Content-Type:** format of the body (\`application/json\`)
- **Accept:** format the client wants
- **Authorization:** credentials (\`Bearer <token>\`)
- **Cache-Control**, **ETag**, **Set-Cookie**
- **X-RateLimit-*:** rate limit information

## A request and response

\`\`\`
POST /posts
Content-Type: application/json

{ "title": "hello", "body": "first post", "userId": 1 }

HTTP/1.1 201 Created
{ "id": 101, "title": "hello", "body": "first post", "userId": 1 }
\`\`\`

## Practice

Which status code would you expect for: (a) creating a user, (b) requesting a missing page, (c) sending a malformed JSON body, (d) calling an API without a token?`,
        [q("Which method is used to create a new resource?", ["GET", "POST", "DELETE", "HEAD"], 1, "POST creates a resource."), q("401 versus 403: which means 'authenticated but not allowed'?", ["401", "403", "404", "500"], 1, "403 Forbidden means the server knows who you are but you lack permission; 401 means authentication is missing or invalid."), q("Which status code means the server failed?", ["200", "404", "500", "301"], 2, "5xx codes indicate server-side errors.")],
        ["Methods say what to do, status codes say what happened, and headers carry the details.", "Like postal mail: the verb is the instruction, the status is the delivery slip, the headers are the label.", [["Method", "GET, POST, PUT, DELETE", "Intent of the request"], ["Status", "2xx, 4xx, 5xx", "Result of the request"], ["Headers", "Content-Type, Authorization", "Metadata"]], "Know the verbs and codes so you can judge whether an API behaves correctly.", ["201 for created", "4xx is the client's fault", "5xx is the server's fault"], "Accepting a 200 response that contains an error message as success."]),
      L("JSON, query parameters and request bodies", 12,
`## JSON

**JSON** stores data as key-value pairs, arrays and nested objects.

\`\`\`json
{
  "id": 7,
  "name": "Asha",
  "active": true,
  "roles": ["student", "member"],
  "address": { "city": "Coimbatore", "pin": "641001" }
}
\`\`\`

Types: string, number, boolean, null, array, object. Keys are in double quotes. A missing comma or an extra trailing comma makes the JSON **invalid** (a good negative test).

## Path and query parameters

- **Path parameter:** part of the URL that identifies a resource: \`/users/7\`.
- **Query parameters:** filters after \`?\`, separated by \`&\`: \`/posts?userId=1&_limit=5\`.

## Request body

POST, PUT and PATCH usually send a JSON body. In Postman choose **Body, raw, JSON** and set \`Content-Type: application/json\` (Postman adds it automatically).

## What to test about inputs

| Test | Example |
|---|---|
| Required field missing | no \`title\` |
| Wrong type | \`"userId": "abc"\` |
| Boundary lengths | empty, maximum, one over |
| Extra unknown fields | should be ignored or rejected as designed |
| Invalid JSON | missing quote or bracket |
| Special characters and Unicode | emoji, quotes, Tamil text |
| Large payloads | size limits and error code |

## Reading responses

Check **field names, types and values**, arrays have the expected length, dates use the agreed format, and numbers have the right precision.

## Practice

Write the JSON body to create a user with name, email and a list of two interests, then list five negative tests for it.`,
        [q("Which is valid JSON?", ["{ name: 'Asha' }", "{ \"name\": \"Asha\" }", "{ \"name\": \"Asha\", }", "[ \"a\" \"b\" ]"], 1, "JSON needs double-quoted keys and strings, and no trailing commas."), q("In /posts?userId=1&_limit=5, userId and _limit are:", ["Path parameters", "Query parameters", "Headers", "Cookies"], 1, "They come after the question mark, so they are query parameters."), q("Which is a good negative input test?", ["A missing required field", "A perfect valid body", "Nothing", "The same request"], 0, "Missing, wrong-type and invalid values test validation.")],
        ["JSON carries data as keys and values, and parameters narrow what you ask for.", "Like a form with labelled boxes: the label is the key, what you write is the value.", [["JSON", "Objects, arrays, types", "Strict syntax"], ["Parameters", "Path and query", "Identify and filter"], ["Bodies", "Create or change data", "Test valid and invalid"]], "Test valid, missing, wrong-type and malformed input for every endpoint.", ["Keys use double quotes", "Query params filter", "Break the input on purpose"], "Only sending well-formed, valid bodies."]),
    ] },
    { title: "Working with Postman", summary: "Requests, variables, scripts and runs.", lessons: [
      L("Sending requests and organising collections", 13,
`## Postman at a glance

**Postman** is a tool for building, sending and testing API requests. Main parts of the window:

- **Collections:** folders of saved requests, shared with the team.
- **Request builder:** method, URL, **Params, Authorization, Headers, Body, Scripts, Settings**.
- **Response viewer:** body (Pretty, Raw, Preview), cookies, headers, **status, time and size**.
- **Environments:** sets of variables (dev, test, staging).
- **Console:** every request and script log (View, Show Postman Console).

## Your first requests

1. Click **New, HTTP**.
2. Method **GET**, URL \`https://jsonplaceholder.typicode.com/posts/1\`, click **Send**.
3. Check the status (200 OK), the time and the JSON body.
4. Change to **POST** with URL \`https://jsonplaceholder.typicode.com/posts\`, choose **Body, raw, JSON**, enter a body and send. JSONPlaceholder replies 201 with an \`id\` (it does not really save data).

## Organising a collection

- One **collection per API or project**.
- **Folders per resource** (Users, Posts, Orders).
- **Clear names:** "Create post - valid", "Create post - missing title".
- Add a **description** and an example response for each request.
- Keep **positive and negative** requests together.

## Saving examples and documentation

Postman can generate documentation from your collection, which helps teammates understand each request.

## Practice

Create a collection called "JSONPlaceholder" with GET all posts, GET one post, POST a post, PUT a post and DELETE a post, all named clearly.`,
        [q("What is a Postman collection?", ["A tool update", "A group of saved requests organised for a project", "A response body", "A bug list"], 1, "Collections organise and share requests."), q("Which part shows status code, time and size?", ["The response viewer", "The environment manager", "The Scripts tab", "The sidebar only"], 0, "The response area displays status, time and size."), q("Why name requests clearly, such as 'Create post - missing title'?", ["It is decoration", "It makes purpose and test intent obvious to the team", "It speeds up the server", "It is required by HTTP"], 1, "Clear names make collections self-documenting.")],
        ["Postman lets you build requests, see responses and keep them organised in collections.", "Like a notebook of API experiments with a tidy table of contents.", [["Build", "Method, URL, headers, body", "Send and read"], ["Read", "Status, time, body", "Pretty or raw"], ["Organise", "Collections and folders", "Clear names"]], "Good organisation makes API tests reusable and shareable.", ["One collection per API", "Folders per resource", "Name requests by intent"], "Saving dozens of requests named 'New Request'."]),
      L("Environments and variables", 13,
`## Why variables

Hard-coding \`https://api.test.example.com\` in 80 requests means 80 edits when the server changes. **Variables** store values once and reuse them with double braces: \`{{baseUrl}}\`.

## Variable scopes (narrow to wide)

| Scope | Lives | Use |
|---|---|---|
| **Local** | One request run | Temporary calculations |
| **Data** | One run of a data-driven collection | Values from a CSV or JSON file |
| **Environment** | Selected environment | URLs, users, tokens per environment |
| **Collection** | One collection | Values shared by its requests |
| **Global** | Whole workspace | Rarely; avoid overuse |

When names clash, the **narrower scope wins**.

## Using an environment

1. Create environments **Dev**, **QA**, **Staging**.
2. Add variables: \`baseUrl\`, \`username\`, \`password\`, \`token\`.
3. Choose the environment in the top right.
4. Write URLs as \`{{baseUrl}}/posts/1\`.

Switching environment now retargets the whole collection.

## Secrets

Mark tokens and passwords as **secret** type, keep them in environments (not in collections you share), and never commit real credentials to a repository.

## Dynamic variables

Postman provides generators such as \`{{$randomEmail}}\`, \`{{$guid}}\` and \`{{$timestamp}}\` for unique test data.

\`\`\`json
{ "email": "{{$randomEmail}}", "name": "{{$randomFullName}}" }
\`\`\`

## Practice

Create an environment with \`baseUrl\` and use it in three requests. Then switch the value and confirm all three change.`,
        [q("How is a variable referenced in a Postman request?", ["$baseUrl", "{{baseUrl}}", "<baseUrl>", "%baseUrl%"], 1, "Postman uses double curly braces."), q("If a variable exists in both collection and environment scope, which wins?", ["Collection", "Environment (the narrower scope)", "The oldest", "Neither"], 1, "Environment scope is narrower than collection scope, so it wins."), q("What is a good practice for passwords and tokens?", ["Hard-code them in every request", "Store them as secret environment variables and never share real ones", "Email them", "Commit them to GitHub"], 1, "Keep secrets in secret environment variables and out of shared files.")],
        ["Variables store values once so requests work in any environment.", "Like a contact name that always points to the current phone number.", [["Define", "baseUrl, token, user", "Per environment"], ["Use", "{{baseUrl}}/posts", "In URL, headers, body"], ["Switch", "Dev, QA, Staging", "Whole collection retargets"]], "Environments and variables make collections reusable and safe.", ["Narrower scope wins", "Mark secrets as secret", "Use dynamic variables for unique data"], "Hard-coding the server URL and credentials in every request."]),
      L("Writing tests with pm.test and pm.expect", 16,
`## The Scripts tab

In the **Scripts** tab (Post-response, formerly "Tests") you write JavaScript that runs after the response arrives. Results appear in the **Test Results** tab as PASS or FAIL.

## Core checks

\`\`\`javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response time is under 800 ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(800);
});

pm.test("Content-Type is JSON", function () {
  pm.response.to.have.header("Content-Type");
  pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
\`\`\`

## Checking the body

\`\`\`javascript
const body = pm.response.json();

pm.test("Post 1 has the expected shape", function () {
  pm.expect(body).to.have.property("id", 1);
  pm.expect(body.title).to.be.a("string").and.not.empty;
  pm.expect(body.userId).to.be.a("number");
});

pm.test("List has 100 posts", function () {
  pm.expect(pm.response.json()).to.have.lengthOf(100);
});
\`\`\`

## Useful assertions

- \`.to.eql(value)\` deep equal, \`.to.equal(value)\` strict equal
- \`.to.include("text")\`, \`.to.match(/regex/)\`
- \`.to.be.above(n)\`, \`.to.be.below(n)\`
- \`.to.have.property("key")\`, \`.to.be.an("array")\`, \`.to.be.oneOf([...])\`

## Good test habits

1. **One purpose per pm.test** with a clear name.
2. Assert **the contract** (status, fields, types), not only "it returned something".
3. Avoid testing data that changes every call (timestamps) unless you check format.
4. Add **negative tests**: expect 400, 401, 404 where appropriate.

## Practice

For GET /posts/1 write four pm.test blocks: status 200, JSON content type, id equals 1, title is a non-empty string.`,
        [q("Where do you write post-response checks in Postman?", ["In the Scripts tab (Post-response)", "In the URL bar", "In the environment name", "In the response body"], 0, "Post-response scripts run after the response is received."), q("Which assertion verifies the status is 201?", ["pm.response.to.have.status(201)", "pm.status = 201", "pm.test(201)", "pm.response.status == 201;"], 0, "pm.response.to.have.status checks the status code."), q("What is a good practice when writing pm.test blocks?", ["One purpose per test with a clear name", "One huge test for everything", "No names", "Skipping negative tests"], 0, "Small named tests report exactly what failed.")],
        ["Scripts run after each response and report PASS or FAIL for each check.", "Like a checklist the inspector ticks automatically after each delivery.", [["Response", "pm.response.json()", "Read the data"], ["Assert", "pm.expect, pm.test", "Status, fields, time"], ["Result", "Test Results tab", "PASS or FAIL per check"]], "Automated assertions turn a manual API call into a repeatable test.", ["Name every test", "Check status, shape and values", "Add negative tests"], "Writing a single test that only checks 'status is not 500'."]),
    ] },
    { title: "Chaining, Automation and Reporting", summary: "Run many requests and read the results.", lessons: [
      L("Chaining requests and authentication", 15,
`## Passing data between requests

Real flows depend on earlier responses: log in, take the token, create an item, use its ID. Save values into variables in a **post-response script**:

\`\`\`javascript
// Login request: save the token
const data = pm.response.json();
pm.environment.set("token", data.token);

// Create request: save the new ID
pm.environment.set("postId", pm.response.json().id);
\`\`\`

Use them in later requests: header \`Authorization: Bearer {{token}}\` and URL \`{{baseUrl}}/posts/{{postId}}\`.

## Pre-request scripts

Code in the **Pre-request** tab runs before sending: generate data, compute a signature or set a timestamp.

\`\`\`javascript
pm.variables.set("title", "Test " + Date.now());
\`\`\`

## Authentication types

| Type | How | Postman setting |
|---|---|---|
| **API key** | A key in a header or query | Authorization, API Key |
| **Basic auth** | Username and password, Base64 encoded | Authorization, Basic Auth |
| **Bearer token** | A token (often a JWT) in the Authorization header | Authorization, Bearer Token |
| **OAuth 2.0** | Tokens obtained from an authorisation server | Authorization, OAuth 2.0 |

Set authorisation once at the **collection or folder** level and let requests inherit it.

## Authorisation tests

- No token: expect **401**.
- Expired or tampered token: expect **401**.
- Valid token for the wrong role or another user's data: expect **403** (or 404 by design).
- Token for user A must never read user B's private data.

## Practice

Describe the sequence of requests and the variables you would save for: login, create order, get order, delete order.`,
        [q("Which statement saves a value from the response into an environment variable?", ["pm.environment.set('token', data.token)", "pm.save(token)", "var token", "pm.response.save"], 0, "pm.environment.set stores a value for later requests."), q("A request with no token to a protected endpoint should return:", ["200", "401", "201", "204"], 1, "Missing authentication yields 401."), q("Where should shared authentication be configured for easy reuse?", ["On each request separately", "At the collection or folder level", "In the response", "In the browser"], 1, "Requests can inherit auth from their collection or folder.")],
        ["Save data from one response into variables and use it in the next request.", "Like passing a ticket number from the first desk to the second.", [["Capture", "pm.environment.set", "Token, ID"], ["Reuse", "{{token}}, {{postId}}", "Later requests"], ["Protect", "Auth tests", "No token, wrong role"]], "Chained requests test real workflows, and authorisation tests prove data is protected.", ["Save tokens and IDs", "Inherit auth from the collection", "Test access without and with wrong permissions"], "Copying tokens by hand between requests so tests cannot run unattended."]),
      L("Collection Runner, data-driven tests and Newman", 15,
`## Collection Runner

The **Collection Runner** runs all requests in a collection (or folder) in order and reports every test result. Options: iterations, delay between requests, environment, and a data file.

## Data-driven testing

Run the same requests with many inputs from a **CSV or JSON** file.

\`\`\`csv
title,userId,expectedStatus
Hello,1,201
,1,400
A very long title,9999,400
\`\`\`

In the request body use \`{{title}}\` and \`{{userId}}\`; in the test, read the expected value with \`pm.iterationData.get("expectedStatus")\`.

\`\`\`javascript
pm.test("Status matches expectation", function () {
  pm.response.to.have.status(Number(pm.iterationData.get("expectedStatus")));
});
\`\`\`

## Newman: Postman from the command line

**Newman** runs collections in a terminal or CI pipeline.

\`\`\`bash
npm install -g newman
newman run my-collection.json -e qa-environment.json --reporters cli,htmlextra
\`\`\`

Export the collection and environment as JSON from Postman. Newman returns a **non-zero exit code when tests fail**, so a CI server can stop the pipeline.

## Monitoring and reports

Postman monitors can run collections on a schedule from the cloud and alert you when something breaks. Reports show **pass/fail counts, response times and failed assertions**.

## Good practice

- Make collections **independent of data left by earlier runs** (create, then clean up).
- Use **unique data** per run.
- Keep **secrets** in CI variables, not in the exported files.
- Fail the build on any test failure.

## Practice

Write a three-row data file for a create-user request (valid, missing name, invalid email) with the expected status for each.`,
        [q("What does Newman do?", ["Designs APIs", "Runs Postman collections from the command line or CI", "Replaces Postman", "Writes documentation only"], 1, "Newman is the command-line runner for collections."), q("What makes a collection data-driven?", ["Using a CSV or JSON file to run the requests with many inputs", "Using more headers", "Using Basic auth", "Naming requests"], 0, "A data file feeds each iteration with different values."), q("Why does Newman's non-zero exit code matter?", ["It lets CI stop the build when tests fail", "It saves disk", "It hides errors", "It speeds the network"], 0, "CI tools treat a non-zero exit as failure.")],
        ["The Collection Runner and Newman run all your requests and tests, with data files for many inputs.", "Like running a whole test class at once with different student answers.", [["Run", "Collection Runner", "All requests in order"], ["Drive", "CSV or JSON data", "Many inputs, one set of requests"], ["Automate", "Newman in CI", "Fail the build on failure"]], "Automate runs so every build verifies the API.", ["Use data files for variations", "Run Newman in CI", "Keep secrets out of exports"], "Leaving API tests to be run by hand before each release."]),
      { ...L("Challenge: classify HTTP status codes", 12,
`## Your task

API testers read status codes constantly. In this exercise you write a small program that classifies codes the same way you would when reviewing a Postman run.

## Rules

- 200 to 299: \`success\`
- 300 to 399: \`redirect\`
- 400 to 499: \`client error\`
- 500 to 599: \`server error\`
- anything else: \`unknown\`

Read one line of status codes separated by spaces and print the class of each, separated by commas and a space. Test with a few of your own codes (including 99 and 600) before you submit.`,
        [q("201 belongs to:", ["Success (2xx)", "Redirect", "Client error", "Server error"], 0, "201 Created is a success code."), q("404 belongs to:", ["Success", "Redirect", "Client error", "Server error"], 2, "404 Not Found is a client error."), q("503 belongs to:", ["Success", "Redirect", "Client error", "Server error"], 3, "503 Service Unavailable is a server error.")],
        ["Group status codes by their first digit to judge responses quickly.", "Like sorting letters into mailboxes by the first number of the postcode.", [["2xx", "Success", "Request worked"], ["4xx", "Client error", "Request was wrong"], ["5xx", "Server error", "Server failed"]], "The first digit tells you who is at fault.", ["2xx success", "4xx client error", "5xx server error"], "Treating every non-200 code as the same kind of problem."]),
        challenge: pyChallenge("Classify status codes", "Read one line of HTTP status codes separated by spaces. For each code print its class: success (200-299), redirect (300-399), client error (400-499), server error (500-599) or unknown. Print the classes separated by a comma and a space.", "codes = list(map(int, input().split()))\n# build the list of class names and print it\n",
          [{ input: "200 404 500", expected: "success, client error, server error" }, { input: "301 201", expected: "redirect, success" }, { input: "99 600 418", expected: "unknown, unknown, client error", hidden: true }],
          ["Write a helper function that takes one code and returns its class.", "Use comparisons like 200 <= code < 300.", "Join the results with ', '."],
          "def classify(code):\n    if 200 <= code < 300:\n        return 'success'\n    if 300 <= code < 400:\n        return 'redirect'\n    if 400 <= code < 500:\n        return 'client error'\n    if 500 <= code < 600:\n        return 'server error'\n    return 'unknown'\n\ncodes = list(map(int, input().split()))\nprint(', '.join(classify(c) for c in codes))",
          "A small function maps each code to its class using range checks; the results are joined with a comma and a space.") },
    ] },
  ],
  final: [
    q("Why are API tests faster and more stable than UI tests?", ["They avoid browser rendering and layout changes", "They are slower", "They need no server", "They cannot fail"], 0, "No UI dependency."),
    q("Which method creates a resource?", ["POST", "GET", "HEAD", "TRACE"], 0, "POST creates."),
    q("Which status means a resource was created?", ["201", "200", "404", "500"], 0, "201 Created."),
    q("401 means:", ["Authentication missing or invalid", "Server crashed", "Resource created", "Redirect"], 0, "Unauthorized (unauthenticated)."),
    q("403 means:", ["Authenticated but not permitted", "Not found", "Created", "Server error"], 0, "Forbidden."),
    q("A 5xx code indicates:", ["Server error", "Client error", "Success", "Redirect"], 0, "Server-side failure."),
    q("Which is valid JSON?", ["{\"a\": 1}", "{a: 1}", "{'a': 1}", "{\"a\": 1,}"], 0, "Double-quoted keys and no trailing comma."),
    q("In /items?type=book&limit=5 the parts after ? are:", ["Query parameters", "Path parameters", "Headers", "Cookies"], 0, "Query parameters."),
    q("How do you reference an environment variable named baseUrl?", ["{{baseUrl}}", "$baseUrl", "<baseUrl>", "%baseUrl%"], 0, "Double curly braces."),
    q("Where should real passwords and tokens be kept?", ["Secret environment variables, never shared or committed", "In every request body", "In public collections", "In emails"], 0, "Keep secrets out of shared files."),
    q("Which line checks the status code in a Postman test?", ["pm.response.to.have.status(200)", "pm.status(200)", "status == 200", "check(200)"], 0, "The pm API."),
    q("Which line saves a token for later requests?", ["pm.environment.set(\"token\", data.token)", "token = data.token", "pm.save(\"token\")", "pm.token"], 0, "Store it in an environment variable."),
    q("A request without a token to a protected endpoint should return:", ["401", "200", "201", "204"], 0, "Unauthenticated."),
    q("What does Newman do?", ["Runs collections from the command line and CI", "Edits images", "Hosts websites", "Designs UIs"], 0, "CLI collection runner."),
    q("A data-driven test uses:", ["A CSV or JSON file to supply inputs", "A larger screen", "A longer URL", "More environments only"], 0, "Data files drive iterations."),
  ],
  project: { title: "Capstone: test the JSONPlaceholder API", brief: "Build a Postman collection for JSONPlaceholder covering GET, POST, PUT, PATCH and DELETE on /posts. Use an environment with baseUrl, write pm.test checks for status, content type, response time and body shape, add three negative tests, chain at least two requests with a saved variable, run a data-driven iteration from a CSV, and export the collection plus a Newman run report." },
});

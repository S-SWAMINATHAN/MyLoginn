# LogiQuest code runner (free, self-owned)

A tiny Vercel project that runs learners' **Python** (Pyodide/WebAssembly) and **JavaScript** and returns the output.
It is deliberately **separate from the main MyLoginn project and holds no secrets** - no database URL, no API keys - so
even if a learner escaped the sandbox there is nothing to steal.

Costs: nothing extra. It uses a second free Vercel project and its free `*.vercel.app` address. No server, no GoDaddy
DNS change.

## How it stays safe
- Every request runs in a brand-new worker thread with an **empty environment** (it cannot read `EXEC_TOKEN`).
- Each test case gets a fresh interpreter namespace; nothing survives between learners.
- 4.5 s per test case, then the worker is killed (this also stops infinite loops inside WebAssembly).
- Only `python` and `javascript`; JavaScript has no `require` except `fs.readFileSync` for stdin.
- Requests need `Authorization: <EXEC_TOKEN>`; with no token configured the service refuses to run anything.
- Input is capped (30 KB code, 2.5 MB per input, 4 MB per request).

Honest limits: Python/JavaScript only (Java, C, C++, C#, Go, PHP, Kotlin need a real server such as Piston).
JavaScript uses Node's `vm`, which is not a hard security boundary on its own - the protection is the secret-free
project plus the empty-environment worker. Vercel's Hobby plan is for non-commercial use; since MyLoginn takes
payments, check Vercel's terms and use Pro for this project if required.

## Deploy (about 10 minutes)
1. Pick a long random token, e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. Vercel dashboard -> **Add New... -> Project** -> import the **same GitHub repo** again.
   - **Root Directory:** `exec-service`
   - **Framework Preset:** Other
   - **Environment Variables:** `EXEC_TOKEN` = your token  (this is the only variable; do **not** copy any others)
3. Deploy. Note the URL, e.g. `https://myloginn-exec.vercel.app`.
4. In your **main** MyLoginn project -> Settings -> Environment Variables add (Production):
   ```
   LQ_EXEC_URL=https://myloginn-exec.vercel.app
   LQ_EXEC_TOKEN=<the same token>
   LQ_EXEC_BATCH=1
   LQ_EXEC_LANGUAGES=python,javascript
   ```
   then **redeploy** the main project.
5. Check it from your PC:
   ```
   LQ_EXEC_URL=https://myloginn-exec.vercel.app LQ_EXEC_TOKEN=<token> node scripts/lq-exec-check.mjs python javascript
   ```
   Every line should say PASS. A request without the token must return 401.

## Run the tests locally
```
cd exec-service
npm install
npm test            # 12 checks: auth, batches, errors, infinite loops, long lines, sandbox escape
EXEC_TOKEN=dev npm run dev   # serves http://127.0.0.1:2000/api/v2/execute
```

## Later upgrade
When you want the other seven languages, run Piston on a VPS (`deploy/exec-server/setup.sh`) and set `LQ_EXEC_URL`
to it; remove `LQ_EXEC_BATCH` and `LQ_EXEC_LANGUAGES`. The main app speaks both.

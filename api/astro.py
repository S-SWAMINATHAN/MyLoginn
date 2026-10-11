"""
Vercel Python function that serves the astrology FastAPI app (astrology/backend) from the SAME project and domain.

  browser -> /api/astrology/<path>   (Next.js proxy, src/app/api/astrology/[...path]/route.ts)
          -> /api/astro/api/<path>   (this function, via the rewrite in vercel.json)

Serverless notes: the deployment filesystem is read-only, so SQLite lives in /tmp (it is rebuilt on a cold start),
and the WeasyPrint PDF engine is not installed (it needs Pango), so /api/pdf/* answers 503 on this host.
"""
import hashlib
import os
import sys
import tempfile
from pathlib import Path
from urllib.parse import parse_qsl, urlencode

ROOT = Path(__file__).resolve().parent.parent / "astrology"
sys.path.insert(0, str(ROOT))

_TMP_DB = os.path.join(tempfile.gettempdir(), "jathagam.db")
# Always use a private temp SQLite file. The Vercel project's own DATABASE_URL belongs to the website (Postgres) and must
# never be picked up by the astrology tables.
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DB}"
os.environ.setdefault("SE_EPHE_PATH", str(ROOT / "ephe"))
# This function is publicly routable, so it must only answer the website's own proxy (which enforces payment for the
# print PDFs). Without an explicit ASTROLOGY_API_SECRET, derive the shared secret from JWT_SECRET; the proxy does the same.
if not os.environ.get("ASTROLOGY_API_SECRET") and os.environ.get("JWT_SECRET"):
    os.environ["ASTROLOGY_API_SECRET"] = hashlib.sha256(("astrology-api:" + os.environ["JWT_SECRET"]).encode()).hexdigest()

try:
    from backend.app.main import app as _backend  # noqa: E402
    from backend.app.services import name_db  # noqa: E402

    name_db.DB_PATH = _TMP_DB  # the baby-name tables are created on demand in the writable temp database
    _startup_error = None
except Exception as exc:  # report the real reason instead of an opaque platform 500
    import traceback

    _startup_error = f"{type(exc).__name__}: {exc}" + "\n" + "".join(traceback.format_exc().splitlines(True)[-12:])
    print("astrology function failed to start:", _startup_error)


class RestorePath:
    """vercel.json rewrites /api/astro/<rest> to /api/astro?__p=<rest>; put the real path back before FastAPI routes it."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            query = parse_qsl(scope.get("query_string", b"").decode(), keep_blank_values=True)
            forwarded = next((value for key, value in query if key == "__p"), None)
            path = scope["path"]
            if forwarded is not None:
                path = "/" + forwarded.lstrip("/")
                query = [(key, value) for key, value in query if key != "__p"]
            elif path.startswith("/api/astro"):
                path = path[len("/api/astro"):] or "/"
            scope = dict(scope, path=path, raw_path=path.encode(), query_string=urlencode(query).encode())
        await self.app(scope, receive, send)


async def _failed(scope, receive, send):
    if scope["type"] != "http":
        return
    body = ('{"detail": "The astrology service failed to start on the server.", "python": "%s", "error": %s}'
            % (sys.version.split()[0], __import__("json").dumps(_startup_error))).encode()
    await send({"type": "http.response.start", "status": 502, "headers": [(b"content-type", b"application/json")]})
    await send({"type": "http.response.body", "body": body})


app = RestorePath(_backend) if _startup_error is None else _failed

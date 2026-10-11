"""
Browser-print mode for the print PDFs.

Hosts without the Pango libraries (Vercel) cannot run WeasyPrint. With `?format=html` the same print-ready page is returned
as HTML instead; the browser prints it ("Save as PDF") with its own text shaping. Fonts and images are rewritten from local
file URLs to the copies served by the website under /astrology/pdf/.
"""
from __future__ import annotations

import contextvars
import re

# Set per request by the /pdf router (api/pdf.py) when the client asks for format=html.
BROWSER_MODE: contextvars.ContextVar[bool] = contextvars.ContextVar("pdf_browser_mode", default=False)

_ASSET = re.compile(r"""file:///[^"')\s]*?/(?:app/)?(fonts/[^"')\s]+|assets/(?:deity|covers)/[^"')\s]+|assets/logo\.png)""")


def browser_html(html: str) -> str:
    """Point every local font / image reference at /astrology/pdf/... so a browser can load it."""
    return _ASSET.sub(lambda m: "/astrology/pdf/" + m.group(1).replace("assets/", "", 1), html)

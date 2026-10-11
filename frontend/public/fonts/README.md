# Tamil-style panel fonts

`tamil/MLATamil-NNN.woff2` are the owner-supplied STMZH fonts (st-089 … st_144)
converted to **Unicode OpenType** so they can render the site's Unicode Tamil text.
They are declared in `app/globals.css` (`@font-face "MLA Tamil NNN"`) and listed in
`lib/jathagamTheme.tsx` → `TAMIL_FONTS`. The PDF server uses the matching
`backend/app/fonts/MLATamil-NNN.ttf` files.

The handwritten face **Kavivanar** (Google Fonts) is kept and stays the default.

To rebuild the fonts from the original TTFs see
`backend/tools/tamil_font_build/build_fonts.py` (needs `fonttools` and `brotli`).

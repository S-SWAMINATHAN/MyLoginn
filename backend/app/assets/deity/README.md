# Deity pictures for the PDF cover and the single-page corners

Put the pictures you want here (you must own or have licence to use them):

| Choice | File name (first found is used) |
|---|---|
| விநாயகர் / Ganesha | `ganesha.svg`, `ganesha.png`, `ganesha.jpg` |
| முருகன் / Murugan | `murugan.svg`, `murugan.png`, `murugan.jpg` |
| ஓம் / Om | `om.svg`, `om.png`, `om.jpg` |

**Use a transparent background.** The pictures sit on the palette's paper colour,
so a white (or any) background shows as a box. Use SVG, or PNG with an alpha
channel. The three files shipped here are transparent PNGs (white background
removed with soft, halo-free edges and cropped to the figure).

For a picture that never pixelates, use **SVG** (vector). For PNG use at least
**800 px** on the short side; the cover prints it at 4.6 cm and the single-page
corners at 1.7 cm, and the file is embedded unchanged. If no file is present the
built-in line-art emblem is used on the cover.

The website's single page uses smaller copies in `frontend/public/deity/`
(same pictures, 400 px tall) — replace those too when you change a picture.

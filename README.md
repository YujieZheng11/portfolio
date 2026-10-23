# Yujie Zheng — Portfolio

Static portfolio site (no build step). Published with GitHub Pages.

- `index.html` — page structure, hero copy, about text, meta/OG tags
- `projects.js` — project titles, categories, descriptions, image captions
- `styles.css` — colours, type, layout, responsive rules
- `app.js` — filtering, project dialog, index dialog, particle artwork
- `type-lab.js` / `typeface-data.js` — original-letterform typesetter and glyph metrics
- `lettering-showcase.js` — 13 individually selectable Bussey Building studies with a pinned comparison
- `assets/` — 9 covers, 28 gallery images, 67 transparent glyphs, 13 lettering studies, social preview image

## Local preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory, then open http://localhost:8000/. No dependencies or build step are needed.

## Languages and presentation

- The header’s 中 / EN controls switch the site language. The first visit follows the browser language; subsequent visits use the saved preference when browser storage is available.
- `translations.js` contains English and Chinese interface text, biography, metadata and accessibility labels. `projects.js` contains English project copy and its Chinese counterparts.
- Every project’s `slides` array specifies image order. The original six projects use `[3, 2, 1]`; the three additions start with image 1. Captions remain tied to their original numbered images. Project counts are generated from the data.
- Covers use the original artwork in a shared neutral editorial frame. Project boards retain their original embedded text; descriptions and image captions are bilingual.
- The introduction between the hero and selected work contains the designer’s background and statement. Responsive spacing and typography are defined in `styles.css`.

## Added projects

- **Emotion Map** — final website mockups, emotional mapping and interface development. Includes the project website link recorded in the source PDF.
- **Water, Water Everywhere** — folded zine, tear-off poster, water-mark type experiments and printed spreads from `Unit10.pdf`.
- **Building Letters** — only pages 13–15 of the supplied `portfolio.pdf`: Bussey Building title studies, type concept and complete alphabet.

The Building Letters specimen uses the actual raster glyphs extracted from the supplied artwork. It supports uppercase, lowercase and the supplied punctuation, with size/spacing controls, paper/grid toggles and an A–Z detail inspector. Characters absent from the board are visibly marked in a system font. No installable font is implied. The artwork and image captions remain accessible when JavaScript is available; the original boards can also be opened at full size.

The Bussey Building studies appear first in the project. Every title treatment is extracted separately from page 13. Choose a thumbnail or use the arrow controls to change the enlarged study; pin one to compare it with subsequent choices. Black/white inversion and keyboard arrow navigation are supported. These title treatments are presented as the original lettering artwork rather than being substituted into the separate A–Z type system.

Source/page mappings are kept in `../review/asset-sources.json`. Re-extract with `python ../tools/add_project_assets.py` (PyMuPDF and Pillow required; the source PDFs must still be available). Run the browser checks with `node ../tools/check_new_projects.mjs` while the local preview is running.

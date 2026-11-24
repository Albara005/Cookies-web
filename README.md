# Home Crumbs: homemade cookie website

A one-page website for a small home bakery that sells homemade cookies.

- **No build step.** Plain HTML, CSS and JavaScript. Open `index.html` in a browser, or upload the folder to any static host (GitHub Pages, Netlify, Vercel).
- **Hand-drawn cookies.** Every cookie illustration is an SVG drawn in code, so the site needs no image files. You can swap in real photos later.
- **Cookie box (cart).** Visitors add boxes of 6, change quantities, and the box is remembered in their browser.
- **Order form.** It checks name, phone and date (at least one day ahead), then opens the visitor's email app with the whole order already written.
- Works on phones, tablets and desktops. It supports keyboard navigation and screen readers, and respects reduced-motion settings.

## Files

| File | What it is |
|------|------------|
| `index.html` | Page content: hero, menu, story, how-to-order, reviews, order form |
| `styles.css` | All styling. Colours and fonts are variables at the top (`:root`) |
| `script.js`  | Cookie drawings, menu, cart and order form |

## Make it yours

1. **Your email:** in `script.js`, change `orderEmail` in the `SHOP` settings at the top.
2. **Your cookies and prices:** edit the `COOKIES` list in `script.js`. Each entry has a name, a price per box, a category (`classic`, `chocolate` or `special`), a description and an optional badge.
3. **Shop name, hours, delivery area:** edit the text in `index.html`. Search for "Home Crumbs" and for the "Baking days" section.
4. **Colours:** change the `--color-*` variables at the top of `styles.css`.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

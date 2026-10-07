# Blend and Brew

The website for Blend and Brew: thick milkshakes, icy premium slushies and a vegan
coffee frappe. It's a plain static site (HTML, CSS, vanilla JS), with no build step
and no framework, so GitHub Pages can serve it as-is.

Every drink on the page is a hand-drawn SVG generated from the menu data. There are
no product photos to keep up to date.

## Run it locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Every push to `main` deploys through GitHub Actions
(`.github/workflows/pages.yml`, with Pages source set to *GitHub Actions*). It also
runs on demand from the Actions tab. Only `index.html`, `404.html`, `css/`, `js/` and
`assets/` are published. The site is served at
`https://naughtybeanconsulting.github.io/BlendAndBrew/`.

All paths are relative, so it also works unchanged on a custom domain (add a `CNAME`
file). If you do move it, update the two absolute URLs in the `og:` meta tags at the
top of `index.html`, since link previews need absolute URLs.

## Common edits

| To change… | Edit |
| --- | --- |
| Address, hours, Instagram/Facebook/TikTok, WhatsApp number | `js/config.js`. Blank fields stay hidden on the site |
| A price or cup size | `CATS` in `js/drinks.js`, plus the matching text in `index.html` (hero board, section price tags, JSON-LD) |
| Add or remove a flavour | One line in `DRINKS` in `js/drinks.js`, plus one `<li class="drink">` in the right shelf in `index.html` |
| The social share image | `tools/og-image.html`. Serve the site locally, open that page at 1200×630, screenshot it to `assets/og-image.jpg` |

Setting `whatsapp` in `js/config.js` makes the order slip's button send straight to the
shop. Without it, the customer picks who to send the order to (handy for office rounds).

## What's where

```
index.html        the page
404.html          "Spilled it." (GitHub Pages serves this for any missing URL)
css/style.css     all styling
js/drinks.js      the menu data + the SVG cup/fruit illustrations
js/main.js        hero menu board, pouring cups, the order slip
js/config.js      shop details
assets/           logos, favicons, share image
img/              original logo artwork (not published)
```

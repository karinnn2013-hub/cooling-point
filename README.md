# CoolingPoint Peak Solar Relief

Ready-to-host static website, exported on 2026-11-06.

## Deploy with GitHub Pages

1. Extract this ZIP.
2. Commit the extracted contents to your GitHub repository root. `index.html` must be at the root, beside `assets/` and the CSS and JavaScript files.
3. Enable GitHub Pages for the repository and publish the root folder of your chosen branch.

No dependency installation or build step is required. Keep every file and the existing directory structure. `.nojekyll` is included for static hosting.

## Local preview

From the extracted folder, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ in your browser. Use a local web server so the animation frame manifest and other fetched assets load correctly.

The energy panel and its data are included. External reference links and Google Fonts use an internet connection; the website uses fallback fonts if Google Fonts is unavailable.

Source revision: `742b612bb55d8d9bfbf67a913f34f31527d8584c`

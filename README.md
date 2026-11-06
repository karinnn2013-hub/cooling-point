# Peak-Time Energy Within Reach — GitHub Pages package

Exported on 6 November 2026 from deployed Site version **148**.
Source commit: `b3c9137a49b636976459a21c3186a45e85dd80e2`.

This is a complete static website. No build step, npm install, backend, database, or API key is required. The existing English/Chinese language switch is included.

## Deploy to GitHub Pages

1. Extract the ZIP.
2. Upload **all extracted contents**, including `assets/`, `tools/`, and `.nojekyll`, to the repository root. `index.html` must be directly in the root. Do not upload only the ZIP or add an extra enclosing folder.
3. Commit to `main`.
4. Open **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, then **main** and **/(root)**. Click **Save**.
5. Wait for deployment and open the URL shown in Settings.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

On macOS, press Command + Shift + . in Finder to reveal `.nojekyll`. Git includes it with `git add .`.

When updating an existing repository, replace the corresponding website files and commit normally. Keep your existing `CNAME` if your repository uses a custom domain.

## Optional Git upload

Create an empty GitHub repository, then run these commands in the extracted directory. Replace the placeholder URL.

```sh
git init -b main
git add .
git commit -m "Deploy website version 148"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ using HTTP so local JSON requests work correctly.

## Package contents

- `index.html`: main website.
- `assets/`: images, models, icons, and climate data.
- `architecture.html`, `technical-architecture.html`, `energy-panel.html`: supporting pages.
- `Sunroom_Energy_Monitor.html` and `tools/sunroom_pv_runtime.js`: standalone energy monitor and embedded runtime.
- CSS/JS files: styles and interactions.
- `.nojekyll`: direct static publishing.
- `SOURCE_VERSION.json`: source provenance.
- `FILE_CHECKSUMS.json`: SHA-256 hashes, excluding the checksum file itself.

Internal runtime URLs are relative and support GitHub Pages repository subpaths. Google Fonts is the only external runtime service; CSS fallback fonts remain available.

This package excludes Sites hosting configuration, Git history, credentials, and Blender source projects.

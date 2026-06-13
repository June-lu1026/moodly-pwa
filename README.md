# Moodly PWA - fixed mobile install build

This build is optimized for installing Moodly on phones.

## What was fixed

- Safer relative `manifest.json` paths for Render / Netlify / Vercel deployment.
- Updated `start_url`, `scope`, and app `id` so the PWA works even when hosted from a non-root path.
- Improved service worker cache version and same-origin fetch handling.
- Added an in-app install guide for iPhone, because iOS Safari does not support the Android/Chrome install prompt.
- The Settings install button now explains: Safari → Share → Add to Home Screen.

## Deploy

Deploy the contents of this `moodly-webapp` folder as a static site.

### Render

- Service type: Static Site
- Build command: `echo "No build needed"`
- Publish directory: `.`

### Netlify / Vercel

- Build command: empty or `echo "No build needed"`
- Output / publish directory: `.`

## Install on phone

### iPhone / iPad

1. Open the deployed HTTPS URL in Safari.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Tap `Add`.

### Android

1. Open the deployed HTTPS URL in Chrome.
2. Tap the menu button.
3. Tap `Install app` or `Add to Home screen`.

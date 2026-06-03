# Moodly PWA

Moodly is a static Progressive Web App for daily mood tracking.

## Deploy on Render

- Service type: Static Site
- Build command: `echo "No build needed"`
- Publish directory: `.`

## PWA files

- `manifest.json` enables install metadata.
- `service-worker.js` caches the app shell for basic offline access.
- `icons/` contains the app icons used by Android, iOS, and browsers.

After deployment, open the HTTPS URL on your phone:

- iPhone: Safari → Share → Add to Home Screen
- Android Chrome: browser menu → Install app

# Moodly Mobile App UI PWA v23

This version treats Moodly as a mobile app UI first, not a normal webpage.

## Core changes
- Real mood records are saved in localStorage
- Today saves check-ins
- Recent records appear on Today
- Calendar shows recorded mood by date
- Calendar date click shows mood + note
- Insights trend and stats are generated from records
- Chat has typing interaction
- Page transitions and tab feedback added
- Mood icons use custom soft faces, not system emoji
- Logo includes M + smile + circular halo behind M
- PWA install support remains
- Gemini API entry remains

## Upload
Upload these files to GitHub root:

icons/
README.md
app.js
index.html
manifest.webmanifest
render.yaml
service-worker.js
style.css

Do not upload the zip file.

## Gemini API
In app.js, replace:

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

## Render
Static Site
Publish Directory: .
Build Command: blank

Open:
https://moodly-pwa.onrender.com?v=23

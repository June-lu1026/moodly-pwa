# Moodly AI — Gemini-ready package

This package keeps the current Moodly UI and adds a protected Gemini backend for:

- AI Reflection after Check In
- AI Summary on Insights
- Chat replies

The browser never receives your Gemini API key.

## Upload to GitHub

Upload all files and folders in this package to the repository root. Replace files with the same names.

Important root files:

- `server.js`
- `package.json`
- `render.yaml`
- `.env.example`
- `app.js`

Do not create or upload a real `.env` file to GitHub.

## Deploy on Render

1. Push this package to GitHub.
2. Open Render and connect the repository.
3. Create or update the Web Service.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add these environment variables in Render:

```text
GEMINI_API_KEY = your real key
GEMINI_MODEL = gemini-2.5-flash
```

7. Deploy again.

## Confirm the API

Open:

```text
https://YOUR-RENDER-DOMAIN/api/health
```

You should see:

```json
{
  "ok": true,
  "geminiConfigured": true,
  "model": "gemini-2.5-flash"
}
```

## Local test

```bash
npm install
cp .env.example .env
```

Put the real key in `.env`, then run:

```bash
npm start
```

Open `http://localhost:3000`.

## Stable demo fallback

If Gemini is unavailable, Chat falls back to local replies. Reflection and Insights keep their built-in copy, so the competition demo still works.

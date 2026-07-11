import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
app.use(express.static(__dirname, { extensions: ['html'] }));

const allowedTypes = new Set(['chat', 'reflection', 'insight']);

function systemPrompt(type) {
  const common = `You are Moodly AI, a gentle emotional wellness companion.
Follow these rules:
- Match the user's language.
- Be warm, concise, practical, and non-judgmental.
- Do not diagnose or claim to replace a therapist or doctor.
- Do not make certainty claims from limited mood data.
- If the user mentions immediate danger, self-harm, or harming someone, encourage contacting local emergency services and a trusted person now.
- Do not use markdown headings unless needed.`;

  if (type === 'reflection') {
    return `${common}\nWrite one short reflection of 45-80 words based on the mood and optional note. Acknowledge the emotion, avoid clichés, and end with one gentle next step.`;
  }

  if (type === 'insight') {
    return `${common}\nSummarize the recent mood pattern in 1-2 short sentences, under 45 words. Be cautious when the dataset is small.`;
  }

  return `${common}\nContinue a supportive conversation. Keep most replies under 90 words and ask at most one helpful follow-up question.`;
}

function userPrompt({ type, message = '', mood = 'Okay', note = '', history = [], moodRecords = [] }) {
  if (type === 'reflection') {
    return `Current mood: ${String(mood).slice(0, 40)}\nOptional note: ${String(note).slice(0, 600) || 'No note provided.'}`;
  }

  if (type === 'insight') {
    return `Recent mood records:\n${JSON.stringify(Array.isArray(moodRecords) ? moodRecords.slice(-30) : [])}`;
  }

  const safeHistory = Array.isArray(history)
    ? history.slice(-10).map(item => ({
        role: item?.role === 'ai' || item?.role === 'assistant' ? 'assistant' : 'user',
        text: String(item?.text || '').slice(0, 500)
      }))
    : [];

  return `Current mood: ${String(mood).slice(0, 40)}\nConversation history: ${JSON.stringify(safeHistory)}\nLatest user message: ${String(message).slice(0, 1200)}`;
}

async function callGemini(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.');
    error.status = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt(payload.type) }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt(payload) }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: payload.type === 'chat' ? 240 : 180
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || `Gemini request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map(part => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      const error = new Error('Gemini returned an empty response.');
      error.status = 502;
      throw error;
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  });
});

app.post('/api/gemini', async (req, res) => {
  try {
    const payload = req.body || {};
    const type = payload.type || 'chat';

    if (!allowedTypes.has(type)) {
      return res.status(400).json({ error: 'Invalid AI request type.' });
    }

    if (type === 'chat' && !String(payload.message || '').trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const text = await callGemini({ ...payload, type });
    res.json({ text });
  } catch (error) {
    const status = Number(error.status) || (error.name === 'AbortError' ? 504 : 500);
    console.error('[Moodly AI]', error.message);
    res.status(status).json({
      error: status === 503
        ? 'Gemini has not been configured on the server.'
        : status === 504
          ? 'Gemini request timed out.'
          : 'Moodly AI is temporarily unavailable.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Moodly running on port ${PORT}`);
});

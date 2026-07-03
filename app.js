const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

function extractGeminiText(data) {
  if (data && data.error && data.error.message) {
    throw new Error(data.error.message);
  }
  return (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || "";
}

function safeJsonFromText(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    return {
      emotion: "Reflection",
      intensity: "-",
      response: cleaned || "Moodly did not receive a valid response.",
      suggestion: "Try writing one short sentence about how you feel."
    };
  }
}

function renderResult(result) {
  return `
    <div class="result-card">
      <h3>${result.emotion || "Mood Reflection"}</h3>
      <p><strong>Intensity:</strong> ${result.intensity || "-"}</p>
      <p><strong>Moodly says:</strong><br>${result.response || "No response."}</p>
      <p><strong>Small suggestion:</strong><br>${result.suggestion || "Take one slow breath and check in again later."}</p>
    </div>
  `;
}

async function runMoodlyAI() {
  const input = document.getElementById("moodInput");
  const output = document.getElementById("aiOutput");
  const text = input.value.trim();

  if (!text) {
    output.innerHTML = '<p class="muted">Write one sentence about how you feel first.</p>';
    return;
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
    output.innerHTML = '<p><strong>Gemini API key is not set yet.</strong></p><p class="muted">Open app.js and replace YOUR_GEMINI_API_KEY with your Gemini API key.</p>';
    return;
  }

  output.innerHTML = '<p class="muted">Moodly is thinking...</p>';

  const prompt = `You are Moodly AI, a gentle emotional companion.

Analyze the user's emotional state. Do not diagnose. Do not provide medical claims.
Respond warmly, briefly, and practically.

User input:
"${text}"

Return STRICT JSON only:
{
  "emotion": "one short emotion label",
  "intensity": "0-100",
  "response": "a warm 1-2 sentence emotional reflection",
  "suggestion": "one small action the user can take in 5 minutes"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({contents: [{parts: [{text: prompt}]}]})
      }
    );

    const data = await response.json();
    const rawText = extractGeminiText(data);
    const result = safeJsonFromText(rawText);

    output.innerHTML = renderResult(result);
  } catch (error) {
    output.innerHTML = '<p><strong>AI request failed.</strong></p><p class="muted">' + error.message + '</p><p class="muted">Check your API key, Google AI Studio permissions, or browser console.</p>';
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("./service-worker.js").catch(function(){});
  });
}

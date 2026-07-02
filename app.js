async function runAI() {
  const text = document.getElementById("input").value;
  const output = document.getElementById("output");

  output.innerHTML = "Thinking...";

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY",
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Moodly AI. Analyze emotion and return JSON only:
User: ${text}
Return: emotion, intensity, response, suggestion`
          }]
        }]
      })
    }
  );

  const data = await res.json();

  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

  output.innerHTML = "<pre>" + textOut + "</pre>";
}

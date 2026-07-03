const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

let selectedMood = "平静";
let deferredInstallPrompt = null;

document.querySelectorAll("[data-mood]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll("[data-mood]").forEach(function(b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
    selectedMood = btn.dataset.mood;
  });
});

document.querySelectorAll(".tabbar button").forEach(function(btn) {
  btn.addEventListener("click", function() {
    const target = btn.dataset.screen;
    document.querySelectorAll(".screen").forEach(function(screen) { screen.classList.remove("active"); });
    document.getElementById(target).classList.add("active");
    document.querySelectorAll(".tabbar button").forEach(function(item) { item.classList.remove("active"); });
    btn.classList.add("active");
  });
});

window.addEventListener("beforeinstallprompt", function(event) {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.getElementById("installCard").style.display = "flex";
});

document.getElementById("installBtn").addEventListener("click", async function() {
  if (!deferredInstallPrompt) {
    alert("如果浏览器没有弹出安装，请用 Chrome 菜单选择：添加到主屏幕 / Install app。");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

function extractText(data) {
  if (data && data.error && data.error.message) throw new Error(data.error.message);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseMoodly(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); }
  catch(e) {
    return {
      emotion: selectedMood,
      response: cleaned || "我听见了你的感受。你已经开始照顾自己了，这很重要。",
      suggestion: "先做一次深呼吸，然后给自己 5 分钟休息。"
    };
  }
}

async function runMoodlyAI() {
  const input = document.getElementById("moodInput");
  const output = document.getElementById("aiOutput");
  const note = input.value.trim();

  if (!note) {
    output.textContent = "先写下一句话，Moodly 才能理解你的状态。";
    return;
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
    output.innerHTML = "还没有添加 Gemini API Key。<br>打开 app.js，把第一行 YOUR_GEMINI_API_KEY 替换成你的 Key。";
    return;
  }

  output.textContent = "Moodly 正在理解你的情绪...";

  const prompt = `You are Moodly AI, a gentle emotional companion.
Do not diagnose. Do not make medical claims.
User selected mood: ${selectedMood}
User note: ${note}

Return strict JSON only:
{
  "emotion": "short emotion label in Chinese",
  "response": "a warm and gentle reflection in Chinese, 1-2 sentences",
  "suggestion": "one small action in Chinese that can be done in 5 minutes"
}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: [{parts: [{text: prompt}]}]})
    });

    const data = await res.json();
    const raw = extractText(data);
    const result = parseMoodly(raw);

    output.innerHTML = `<b>${result.emotion || selectedMood}</b><br><br>${result.response}<br><br><b>小建议：</b>${result.suggestion}`;
  } catch (error) {
    output.innerHTML = "AI 请求失败：<br>" + error.message;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("./service-worker.js").catch(function(){});
  });
}

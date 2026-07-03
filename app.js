const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const STORE_KEY = "moodly_records_v6";

const I18N = {
  zh: {
    todayTitle:"Today", todaySubtitle:"你好，今天想记录一下心情吗？",
    installTitle:"Install Moodly", installDesc:"添加到手机桌面，像 App 一样打开。", installBtn:"Install",
    currentMood:"当前心情", chooseMood:"选择或描述此刻的感受",
    moodAwful:"很糟糕", moodLow:"低落", moodCalm:"平静", moodHappy:"开心", moodGreat:"很好",
    writeSentence:"写下一句话 ✎", inputPlaceholder:"例如：今天有点累，但也完成了很多事", startRecord:"开始记录",
    aiReflection:"AI 反思", aiReflectionDesc:"基于你的记录，AI 给你的温柔回应", aiWaiting:"记录后，AI 反馈会显示在这里。",
    todayRecords:"今日记录", calendarTitle:"Calendar", calendarSubtitle:"查看你的心情记录", thisMonth:"本月",
    mon:"一", tue:"二", wed:"三", thu:"四", fri:"五", sat:"六", sun:"日",
    recentRecord:"最近记录", noRecords:"还没有记录，先去 Today 写下一句吧。",
    insightsTitle:"Insights", insightsSubtitle:"看见你的情绪变化", weeklyTrend:"本周情绪趋势", thisWeek:"本周",
    triggers:"情绪触发点", localizationTitle:"本地化表达", localizationDesc:"把今天的情绪转成更自然的英文表达。",
    chatSubtitle:"和 Moodly 聊聊", chat1:"Hi，我在这里。你现在感觉怎么样？", messagePlaceholder:"输入你的消息...",
    settingsSubtitle:"管理你的 Moodly", reminders:"🔔 Reminders", theme:"🌙 Theme", light:"Light", language:"🌐 Language",
    exportData:"⬇️ Export Data", privacy:"🛡 Privacy First", localOnly:"Local", deleteData:"🗑 Delete All Data",
    demoStoryTitle:"参赛演示流程", demoStoryText:"选择心情 → 写一句话 → AI回应 → Insights自动更新 → 形成完整情绪闭环。",
    emptyInput:"先写下一句话，Moodly 才能理解你的状态。", thinking:"Moodly 正在理解你的情绪...",
    noKey:"Demo模式：未添加 Gemini API Key，以下是本地模拟反馈。", smallSuggestion:"小建议：",
    demoResponse:"我感觉你今天有一点紧绷，但你已经把感受写下来了，这本身就是一次很温柔的自我照顾。",
    demoSuggestion:"先做 3 次慢呼吸，然后把最重要的一件小事写下来。",
    saved:"已保存到今日记录，并更新 Insights。",
    exportName:"moodly-records.json", confirmDelete:"确定要清空所有 Moodly 记录吗？",
    deleted:"已清空所有记录。", stable:"本周情绪整体较平稳。", rising:"你的情绪趋势正在变好，继续保持当前的节奏。", low:"最近低能量记录偏多，建议减少任务负担并保证休息。"
  },
  en: {
    todayTitle:"Today", todaySubtitle:"How are you feeling today?",
    installTitle:"Install Moodly", installDesc:"Add Moodly to your home screen and open it like an app.", installBtn:"Install",
    currentMood:"Current Mood", chooseMood:"Choose or describe how you feel right now",
    moodAwful:"Awful", moodLow:"Low", moodCalm:"Calm", moodHappy:"Happy", moodGreat:"Great",
    writeSentence:"Write one sentence ✎", inputPlaceholder:"Example: I feel tired today, but I still finished many things", startRecord:"Start Check-in",
    aiReflection:"AI Reflection", aiReflectionDesc:"Based on your note, AI gives you a gentle response", aiWaiting:"After check-in, AI reflection will appear here.",
    todayRecords:"Today Records", calendarTitle:"Calendar", calendarSubtitle:"Review your mood history", thisMonth:"This Month",
    mon:"M", tue:"T", wed:"W", thu:"T", fri:"F", sat:"S", sun:"S",
    recentRecord:"Recent Records", noRecords:"No records yet. Go to Today and write one sentence.",
    insightsTitle:"Insights", insightsSubtitle:"See how your emotions change", weeklyTrend:"Weekly Mood Trend", thisWeek:"This Week",
    triggers:"Mood Triggers", localizationTitle:"Localized Expression", localizationDesc:"Turn today’s emotion into a more natural English expression.",
    chatSubtitle:"Talk with Moodly", chat1:"Hi, I’m here. How are you feeling right now?", messagePlaceholder:"Type your message...",
    settingsSubtitle:"Manage your Moodly", reminders:"🔔 Reminders", theme:"🌙 Theme", light:"Light", language:"🌐 Language",
    exportData:"⬇️ Export Data", privacy:"🛡 Privacy First", localOnly:"Local", deleteData:"🗑 Delete All Data",
    demoStoryTitle:"Demo Flow", demoStoryText:"Choose mood → write one note → AI responds → Insights update → emotional loop complete.",
    emptyInput:"Write one sentence first so Moodly can understand your state.", thinking:"Moodly is understanding your emotion...",
    noKey:"Demo mode: Gemini API Key is not added. This is a local sample reflection.", smallSuggestion:"Small suggestion:",
    demoResponse:"It sounds like you are a little tense today, but writing it down is already a gentle act of self-care.",
    demoSuggestion:"Take three slow breaths, then write down one small thing that matters most.",
    saved:"Saved to today’s records and Insights updated.",
    exportName:"moodly-records.json", confirmDelete:"Delete all Moodly records?",
    deleted:"All records deleted.", stable:"Your mood was generally stable this week.", rising:"Your mood trend is improving. Keep your current rhythm.", low:"Low-energy records are appearing more often. Consider reducing your workload and resting."
  }
};

const MOOD_SCORE = { awful: 1, low: 2, calm: 3, happy: 4, great: 5 };
const TRIGGER_WORDS = {
  work: ["工作","任务","deadline","meeting","老板","项目","压力","work","busy","task","office"],
  sleep: ["睡","困","累","疲惫","熬夜","sleep","tired","exhausted","insomnia"],
  social: ["朋友","同事","家人","关系","社交","social","friend","family","relationship"],
  health: ["头痛","身体","不舒服","病","health","sick","pain"],
  study: ["学习","考试","课程","study","exam","school"]
};

let currentLang = localStorage.getItem("moodly_lang") || "zh";
let selectedMoodKey = "calm";
let deferredInstallPrompt = null;

function t(key){ return I18N[currentLang][key] || I18N.zh[key] || key; }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function timeNow(){ return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function getRecords(){ try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch(e){ return []; } }
function saveRecords(records){ localStorage.setItem(STORE_KEY, JSON.stringify(records)); }

function applyLanguage(){
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.getElementById("langEN")?.classList.toggle("active", currentLang === "en");
  document.getElementById("langZH")?.classList.toggle("active", currentLang === "zh");
  renderAll();
}
function setLanguage(lang){ currentLang = lang; localStorage.setItem("moodly_lang", lang); applyLanguage(); }

function detectTriggers(note){
  const text = note.toLowerCase();
  const result = [];
  Object.entries(TRIGGER_WORDS).forEach(([key, words]) => {
    if (words.some(w => text.includes(w.toLowerCase()))) result.push(key);
  });
  return result.length ? result : ["self"];
}
function triggerLabel(key){
  const zh = {work:"💼 工作压力", sleep:"🌙 睡眠不足", social:"👥 社交能量", health:"🫀 身体状态", study:"📚 学习压力", self:"🌿 自我状态"};
  const en = {work:"💼 Work Pressure", sleep:"🌙 Poor Sleep", social:"👥 Social Energy", health:"🫀 Body State", study:"📚 Study Pressure", self:"🌿 Self State"};
  return (currentLang === "zh" ? zh : en)[key] || key;
}
function moodText(key){ return t("mood" + key.charAt(0).toUpperCase() + key.slice(1)); }

function localReflection(note){
  return {
    emotion: moodText(selectedMoodKey),
    response: t("demoResponse"),
    suggestion: t("demoSuggestion"),
    localized: `I feel ${selectedMoodKey === "awful" || selectedMoodKey === "low" ? "emotionally drained" : selectedMoodKey === "calm" ? "steady and calm" : "lighter and more positive"} today, and I’m trying to stay grounded.`
  };
}

function extractText(data){
  if(data && data.error && data.error.message) throw new Error(data.error.message);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
function parseAI(text){
  const cleaned = text.replace(/```json/gi,"").replace(/```/g,"").trim();
  try { return JSON.parse(cleaned); }
  catch(e){ return { emotion:moodText(selectedMoodKey), response:cleaned || t("demoResponse"), suggestion:t("demoSuggestion"), localized:"I’m trying to understand how I feel today with more kindness." }; }
}

async function runMoodlyAI(){
  const input = document.getElementById("moodInput");
  const output = document.getElementById("aiOutput");
  const note = input.value.trim();
  if(!note){ output.textContent = t("emptyInput"); return; }
  output.textContent = t("thinking");

  let result;
  if(!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"){
    result = localReflection(note);
    output.innerHTML = `<p>${t("noKey")}</p>`;
  } else {
    const prompt = `You are Moodly AI, a gentle emotional companion.
Do not diagnose. Do not make medical claims.
Language: ${currentLang === "zh" ? "Chinese" : "English"}
User selected mood: ${moodText(selectedMoodKey)}
User note: ${note}

Return strict JSON only:
{
  "emotion": "short emotion label",
  "response": "warm 1-2 sentence reflection",
  "suggestion": "one small action within 5 minutes",
  "localized": "a natural English expression of the user's emotion"
}`;
    try{
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      result = parseAI(extractText(await res.json()));
    } catch(err){
      result = localReflection(note);
      result.response += currentLang === "zh" ? "（AI请求失败，已显示本地反馈。）" : " (AI request failed, local reflection shown.)";
    }
  }

  const record = {
    id: Date.now(),
    date: todayISO(),
    time: timeNow(),
    mood: selectedMoodKey,
    score: MOOD_SCORE[selectedMoodKey],
    note,
    reflection: result.response,
    suggestion: result.suggestion,
    localized: result.localized || localReflection(note).localized,
    triggers: detectTriggers(note)
  };
  const records = getRecords();
  records.unshift(record);
  saveRecords(records.slice(0, 120));

  output.innerHTML = `<b>${result.emotion || moodText(selectedMoodKey)}</b><br><br>${result.response}<br><br><b>${t("smallSuggestion")}</b>${result.suggestion}<br><br><small>${t("saved")}</small>`;
  input.value = "";
  renderAll();
}

function recordsLastDays(days=7){
  const now = new Date();
  const min = new Date(now); min.setDate(now.getDate() - (days-1));
  return getRecords().filter(r => new Date(r.date) >= new Date(min.toISOString().slice(0,10)));
}
function last7Dates(){
  const arr = [];
  for(let i=6;i>=0;i--){ const d = new Date(); d.setDate(d.getDate()-i); arr.push(d.toISOString().slice(0,10)); }
  return arr;
}
function avgScoreForDate(date){
  const list = getRecords().filter(r => r.date === date);
  if(!list.length) return null;
  return list.reduce((s,r)=>s+r.score,0)/list.length;
}

function renderToday(){
  const list = getRecords().filter(r => r.date === todayISO());
  const count = document.getElementById("todayCount");
  if (count) count.textContent = String(list.length);
  const box = document.getElementById("todayList");
  if(!box) return;
  if(!list.length){ box.innerHTML = `<div class="record-item">${t("noRecords")}</div>`; return; }
  box.innerHTML = list.slice(0,4).map(r => `<div class="record-item"><strong>${moodText(r.mood)}<small>${r.time}</small></strong>${escapeHTML(r.note)}<br><small>${escapeHTML(r.reflection)}</small></div>`).join("");
}
function renderCalendar(){
  const monthEl = document.getElementById("calendarMonth");
  if (!monthEl) return;
  const d = new Date();
  monthEl.textContent = d.toLocaleDateString(currentLang==="zh" ? "zh-CN" : "en-US", {month:"long", year:"numeric"});
  const grid = document.getElementById("calendarGrid");
  const week = ["mon","tue","wed","thu","fri","sat","sun"].map(k=>`<b>${t(k)}</b>`).join("");
  const year = d.getFullYear(), month = d.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0).getDate();
  let offset = (first.getDay()+6)%7;
  let html = week + "<i></i>".repeat(offset);
  for(let day=1;day<=last;day++){
    const date = new Date(year, month, day).toISOString().slice(0,10);
    const score = avgScoreForDate(date);
    let cls = "";
    if(score !== null){ cls = score <= 1.5 ? "awful" : score <= 2.5 ? "low" : score <= 3.5 ? "mid" : "good"; }
    html += `<i class="${cls}">${day}</i>`;
  }
  grid.innerHTML = html;
  const recent = getRecords().slice(0,6);
  document.getElementById("recentList").innerHTML = recent.length ? recent.map(r=>`<div class="record-item"><strong>${moodText(r.mood)}<small>${r.date} ${r.time}</small></strong>${escapeHTML(r.note)}</div>`).join("") : `<div class="record-item">${t("noRecords")}</div>`;
}
function renderInsights(){
  const chart = document.getElementById("moodChart");
  if (!chart) return;
  const dates = last7Dates();
  const scores = dates.map(d => avgScoreForDate(d));
  const points = scores.map((s,i) => {
    const val = s === null ? 3 : s;
    const x = 25 + i * 45;
    const y = 130 - ((val-1)/4)*90;
    return {x,y,val};
  });
  const poly = points.map(p=>`${p.x},${p.y}`).join(" ");
  chart.innerHTML = `<line x1="20" y1="130" x2="300" y2="130"></line><polyline points="${poly}"></polyline>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5"></circle>`).join("")}`;
  document.getElementById("weekLabels").innerHTML = dates.map(d => `<span>${new Date(d).toLocaleDateString(currentLang==="zh"?"zh-CN":"en-US",{weekday:"short"}).slice(0,2)}</span>`).join("");

  const actual = scores.filter(s => s !== null);
  let summary = t("stable");
  if(actual.length >= 2){
    if(actual[actual.length-1] - actual[0] > .8) summary = t("rising");
    if(actual.filter(s => s <= 2).length >= 2) summary = t("low");
  }
  document.getElementById("weeklySummary").textContent = summary;

  const triggerCounts = {};
  recordsLastDays(14).forEach(r => (r.triggers || []).forEach(k => triggerCounts[k] = (triggerCounts[k] || 0) + 1));
  const sorted = Object.entries(triggerCounts).sort((a,b)=>b[1]-a[1]).slice(0,4);
  document.getElementById("triggerChips").innerHTML = sorted.length ? sorted.map(([k,v])=>`<span>${triggerLabel(k)} · ${v}</span>`).join("") : `<span>${triggerLabel("self")}</span>`;

  const latest = getRecords()[0];
  document.getElementById("localizedExpression").textContent = latest?.localized || "I feel emotionally aware today, and I’m learning to understand myself with more kindness.";
}
function renderChat(){
  const chat = document.getElementById("chatMessages");
  if(!chat || chat.dataset.ready) return;
  chat.dataset.ready = "1";
  const latest = getRecords()[0];
  if(latest) chat.innerHTML += `<div class="bubble left">${escapeHTML(latest.reflection)}</div>`;
}
function renderAll(){ renderToday(); renderCalendar(); renderInsights(); renderChat(); }

function escapeHTML(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function exportData(){
  const blob = new Blob([JSON.stringify(getRecords(), null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = t("exportName");
  a.click();
  URL.revokeObjectURL(a.href);
}
function deleteData(){
  if(confirm(t("confirmDelete"))){
    localStorage.removeItem(STORE_KEY);
    document.getElementById("aiOutput").textContent = t("deleted");
    renderAll();
  }
}

function init(){
  document.querySelectorAll("[data-mood-key]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-mood-key]").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedMoodKey = btn.dataset.moodKey;
    });
  });

  const messageBox = document.getElementById("messageBox");
  document.querySelectorAll(".tabbar button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
      document.getElementById(btn.dataset.screen).classList.add("active");
      document.querySelectorAll(".tabbar button").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      messageBox.classList.toggle("show", btn.dataset.screen === "chat");
      renderAll();
    });
  });

  document.getElementById("startBtn").addEventListener("click", runMoodlyAI);
  document.getElementById("langEN").addEventListener("click", () => setLanguage("en"));
  document.getElementById("langZH").addEventListener("click", () => setLanguage("zh"));
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("deleteBtn").addEventListener("click", deleteData);
  document.getElementById("chatSend").addEventListener("click", () => {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if(!text) return;
    document.getElementById("chatMessages").innerHTML += `<div class="bubble right">${escapeHTML(text)}</div><div class="bubble left">${currentLang==="zh"?"我听到了。你可以把这件事再拆成一个更小的部分。":"I hear you. Try breaking it into one smaller piece."}</div>`;
    input.value = "";
  });
  document.getElementById("installBtn").addEventListener("click", async () => {
    if(!deferredInstallPrompt){ alert(currentLang==="zh" ? "如果没有弹出安装，请用 Chrome 菜单选择：添加到主屏幕 / Install app。" : "If no install prompt appears, use Chrome menu: Add to Home Screen / Install app."); return; }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  });
  applyLanguage();
}

window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); deferredInstallPrompt = event; });
if("serviceWorker" in navigator){ window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js?v=6").catch(()=>{})); }
document.addEventListener("DOMContentLoaded", init);

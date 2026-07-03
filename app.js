const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const STORE_KEY = "moodly_records_simplified_v11";

const I18N = {
  zh: {
    todayTitle:"Today", todaySubtitle:"你好，今天想记录一下心情吗？",
    currentMood:"当前心情", chooseMood:"选择最接近此刻的感受",
    moodAwful:"很糟糕", moodLow:"低落", moodCalm:"平静", moodHappy:"开心", moodGreat:"很好",
    quickNote:"快速记录（可选）", inputPlaceholder:"可以不写，直接选择心情后点击 Check In", checkIn:"Check In",
    dailyEncouragement:"Daily encouragement", aiWaiting:"Small steps today, big changes tomorrow.",
    todayRecords:"今日记录", noRecords:"还没有记录，先去 Today 记录一次吧。",
    reflectionTitle:"AI Reflection", reflectionSubtitle:"基于你的记录，给你温柔回应",
    youMightTry:"You might try", tryWalk:"Take a 5-minute walk to clear your mind.", tryWrite:"Write down three things you’re grateful for.", continueChat:"继续聊天",
    calendarTitle:"Calendar", calendarSubtitle:"查看你的心情记录", thisMonth:"本月",
    mon:"一", tue:"二", wed:"三", thu:"四", fri:"五", sat:"六", sun:"日",
    recentRecord:"最近记录", insightsTitle:"Insights", insightsSubtitle:"看见你的情绪变化", weeklyTrend:"本周情绪趋势", thisWeek:"本周",
    triggers:"情绪触发点", localizationTitle:"本地化表达", localizationDesc:"把今天的情绪转成更自然的英文表达。",
    chatSubtitle:"和 Moodly 聊聊", chat1:"Hi，我在这里。你现在感觉怎么样？", messagePlaceholder:"输入你的消息...",
    settingsSubtitle:"管理你的 Moodly", userSubtitle:"让 Moodly 更懂你 💜",
    reminders:"🔔 Reminders", theme:"🌙 Theme", light:"Light", language:"🌐 Language",
    exportData:"⬇️ Export Data", privacy:"🛡 Privacy First", localOnly:"Local", deleteData:"🗑 Delete All Data",
    thinking:"Moodly 正在理解你的情绪...", noKey:"Demo模式：未添加 Gemini API Key，以下是本地模拟反馈。", smallSuggestion:"小建议：",
    demoResponse:"你已经开始照顾自己的感受了，这本身就是一件很温柔的事。",
    demoSuggestion:"先做 3 次慢呼吸，然后给自己 5 分钟休息。",
    saved:"已保存，并更新 Insights。", exportName:"moodly-records.json", confirmDelete:"确定要清空所有 Moodly 记录吗？",
    deleted:"已清空所有记录。", stable:"本周情绪整体较平稳。", rising:"你的情绪趋势正在变好，继续保持当前的节奏。", low:"最近低能量记录偏多，建议减少任务负担并保证休息。"
  },
  en: {
    todayTitle:"Today", todaySubtitle:"How are you feeling today?",
    currentMood:"Current Mood", chooseMood:"Choose the feeling closest to now",
    moodAwful:"Awful", moodLow:"Low", moodCalm:"Okay", moodHappy:"Good", moodGreat:"Great",
    quickNote:"Quick note (optional)", inputPlaceholder:"Optional: choose a mood and Check In directly", checkIn:"Check In",
    dailyEncouragement:"Daily encouragement", aiWaiting:"Small steps today, big changes tomorrow.",
    todayRecords:"Today Records", noRecords:"No records yet. Go to Today and check in.",
    reflectionTitle:"AI Reflection", reflectionSubtitle:"Gentle response based on your check-ins",
    youMightTry:"You might try", tryWalk:"Take a 5-minute walk to clear your mind.", tryWrite:"Write down three things you’re grateful for.", continueChat:"Continue Chat",
    calendarTitle:"Calendar", calendarSubtitle:"Review your mood history", thisMonth:"This Month",
    mon:"M", tue:"T", wed:"W", thu:"T", fri:"F", sat:"S", sun:"S",
    recentRecord:"Recent Records", insightsTitle:"Insights", insightsSubtitle:"See how your emotions change", weeklyTrend:"Weekly Mood Trend", thisWeek:"This Week",
    triggers:"Mood Triggers", localizationTitle:"Localized Expression", localizationDesc:"Turn today’s emotion into a more natural English expression.",
    chatSubtitle:"Talk with Moodly", chat1:"Hi, I’m here. How are you feeling right now?", messagePlaceholder:"Type your message...",
    settingsSubtitle:"Manage your Moodly", userSubtitle:"Let Moodly understand you better 💜",
    reminders:"🔔 Reminders", theme:"🌙 Theme", light:"Light", language:"🌐 Language",
    exportData:"⬇️ Export Data", privacy:"🛡 Privacy First", localOnly:"Local", deleteData:"🗑 Delete All Data",
    thinking:"Moodly is understanding your emotion...", noKey:"Demo mode: Gemini API Key is not added. This is a local sample reflection.", smallSuggestion:"Small suggestion:",
    demoResponse:"You are already taking care of your feelings, and that matters.",
    demoSuggestion:"Take three slow breaths and give yourself five minutes to rest.",
    saved:"Saved and Insights updated.", exportName:"moodly-records.json", confirmDelete:"Delete all Moodly records?",
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

function t(key){ return I18N[currentLang][key] || I18N.zh[key] || key; }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function timeNow(){ return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function getRecords(){ try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch(e){ return []; } }
function saveRecords(records){ localStorage.setItem(STORE_KEY, JSON.stringify(records)); }
function moodText(key){ return t("mood" + key.charAt(0).toUpperCase() + key.slice(1)); }

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
  let note = input.value.trim();
  const selectedMoodLabel = moodText(selectedMoodKey);
  if(!note){
    note = currentLang === "zh" ? `我现在的心情是：${selectedMoodLabel}` : `My current mood is: ${selectedMoodLabel}`;
  }
  output.textContent = t("thinking");

  let result;
  if(!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"){
    result = localReflection(note);
  } else {
    const prompt = `You are Moodly AI, a gentle emotional companion.
Do not diagnose. Do not make medical claims.
Language: ${currentLang === "zh" ? "Chinese" : "English"}
User selected mood: ${selectedMoodLabel}
User note: ${note}
Return strict JSON only:
{"emotion":"short emotion label","response":"warm 1-2 sentence reflection","suggestion":"one small action within 5 minutes","localized":"a natural English expression of the user's emotion"}`;
    try{
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      result = parseAI(extractText(await res.json()));
    } catch(err){ result = localReflection(note); }
  }

  const record = {
    id: Date.now(), date: todayISO(), time: timeNow(), mood: selectedMoodKey,
    score: MOOD_SCORE[selectedMoodKey], note, reflection: result.response,
    suggestion: result.suggestion, localized: result.localized || localReflection(note).localized,
    triggers: detectTriggers(note)
  };
  const records = getRecords();
  records.unshift(record);
  saveRecords(records.slice(0,120));

  output.innerHTML = `<b>${result.emotion || selectedMoodLabel}</b><br>${result.response}<br><br><b>${t("smallSuggestion")}</b>${result.suggestion}`;
  document.getElementById("reflectionMood").textContent = result.emotion || selectedMoodLabel;
  document.getElementById("reflectionText").textContent = result.response;
  input.value = "";
  renderAll();
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
function recordsLastDays(days=7){
  const now = new Date();
  const min = new Date(now); min.setDate(now.getDate() - (days-1));
  return getRecords().filter(r => new Date(r.date) >= new Date(min.toISOString().slice(0,10)));
}
function renderToday(){
  const list = getRecords().filter(r => r.date === todayISO());
  document.getElementById("todayCount").textContent = String(list.length);
  const box = document.getElementById("todayList");
  if(!list.length){ box.innerHTML = `<div class="record-item">${t("noRecords")}</div>`; return; }
  box.innerHTML = list.slice(0,3).map(r => `<div class="record-item"><strong>${moodText(r.mood)}<small>${r.time}</small></strong>${escapeHTML(r.note)}</div>`).join("");
}
function renderCalendar(){
  const monthEl = document.getElementById("calendarMonth");
  if(!monthEl) return;
  const d = new Date();
  monthEl.textContent = d.toLocaleDateString(currentLang==="zh" ? "zh-CN" : "en-US", {month:"long", year:"numeric"});
  const grid = document.getElementById("calendarGrid");
  const week = ["mon","tue","wed","thu","fri","sat","sun"].map(k=>`<b>${t(k)}</b>`).join("");
  const year = d.getFullYear(), month = d.getMonth();
  const first = new Date(year,month,1), last = new Date(year,month+1,0).getDate();
  let html = week + "<i></i>".repeat((first.getDay()+6)%7);
  for(let day=1;day<=last;day++){
    const date = new Date(year,month,day).toISOString().slice(0,10);
    const score = avgScoreForDate(date);
    let cls = "";
    if(score !== null){ cls = score <= 1.5 ? "awful" : score <= 2.5 ? "low" : score <= 3.5 ? "mid" : "good"; }
    html += `<i class="${cls}">${day}</i>`;
  }
  grid.innerHTML = html;
  const recent = getRecords().slice(0,5);
  document.getElementById("recentList").innerHTML = recent.length ? recent.map(r=>`<div class="record-item"><strong>${moodText(r.mood)}<small>${r.date}</small></strong>${escapeHTML(r.note)}</div>`).join("") : `<div class="record-item">${t("noRecords")}</div>`;
}
function renderInsights(){
  const chart = document.getElementById("moodChart");
  if(!chart) return;
  const dates = last7Dates();
  const scores = dates.map(d => avgScoreForDate(d));
  const points = scores.map((s,i) => {
    const val = s === null ? 3 : s;
    return {x:25+i*45, y:130-((val-1)/4)*90};
  });
  chart.innerHTML = `<line x1="20" y1="130" x2="300" y2="130"></line><polyline points="${points.map(p=>`${p.x},${p.y}`).join(" ")}"></polyline>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5"></circle>`).join("")}`;
  document.getElementById("weekLabels").innerHTML = dates.map(d=>`<span>${new Date(d).toLocaleDateString(currentLang==="zh"?"zh-CN":"en-US",{weekday:"short"}).slice(0,2)}</span>`).join("");
  const actual = scores.filter(s=>s!==null);
  let summary = t("stable");
  if(actual.length>=2){
    if(actual[actual.length-1]-actual[0]>.8) summary=t("rising");
    if(actual.filter(s=>s<=2).length>=2) summary=t("low");
  }
  document.getElementById("weeklySummary").textContent = summary;
  const triggerCounts = {};
  recordsLastDays(14).forEach(r => (r.triggers || []).forEach(k => triggerCounts[k]=(triggerCounts[k]||0)+1));
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
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = t("exportName"); a.click(); URL.revokeObjectURL(a.href);
}
function deleteData(){
  if(confirm(t("confirmDelete"))){ localStorage.removeItem(STORE_KEY); document.getElementById("aiOutput").textContent = t("deleted"); renderAll(); }
}
function switchScreen(target){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(target).classList.add("active");
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("active", b.dataset.screen===target));
  document.getElementById("messageBox").classList.toggle("show", target==="chat");
  renderAll();
}
function init(){
  document.querySelectorAll("[data-mood-key]").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-mood-key]").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected"); selectedMoodKey=btn.dataset.moodKey;
  }));
  document.querySelectorAll("[data-screen]").forEach(btn=>btn.addEventListener("click",()=>switchScreen(btn.dataset.screen)));
  document.querySelectorAll("[data-screen-jump]").forEach(btn=>btn.addEventListener("click",()=>switchScreen(btn.dataset.screenJump)));
  document.getElementById("startBtn").addEventListener("click",runMoodlyAI);
  document.getElementById("langEN").addEventListener("click",()=>setLanguage("en"));
  document.getElementById("langZH").addEventListener("click",()=>setLanguage("zh"));
  document.getElementById("exportBtn").addEventListener("click",exportData);
  document.getElementById("deleteBtn").addEventListener("click",deleteData);
  document.getElementById("chatSend").addEventListener("click",()=>{
    const input=document.getElementById("chatInput"); const text=input.value.trim(); if(!text)return;
    document.getElementById("chatMessages").innerHTML += `<div class="bubble right">${escapeHTML(text)}</div><div class="bubble left">${currentLang==="zh"?"我听到了。我们可以先把这件事拆成一个更小的部分。":"I hear you. Let’s break it into one smaller piece first."}</div>`;
    input.value="";
  });
  applyLanguage();
}
if("serviceWorker" in navigator){ window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js?v=11").catch(()=>{})); }
document.addEventListener("DOMContentLoaded",init);

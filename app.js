const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const STORE_KEY = "moodly_design_match_final_v14";

const I18N = {
  zh: {
    todayTitle:"Today", todaySubtitle:"你现在感觉怎么样？",
    moodQuestion:"你现在感觉怎么样？", moodDesc:"选择最接近你此刻状态的心情。",
    moodGreat:"很好", moodGood:"开心", moodOkay:"平静", moodLow:"低落", moodAwful:"很糟糕",
    noteTitle:"快速记录", optional:"（可选）", notePlaceholder:"你现在在想什么？", checkIn:"Check In",
    encouragementTitle:"每日鼓励", todayRecords:"今日记录", noRecords:"还没有记录，先完成一次 Check In 吧。",
    reflectionTitle:"AI Reflection", reflectionSubtitle:"基于你的记录，给你温柔回应",
    tryTitle:"You might try", tryWalk:"花 5 分钟散步，让大脑放松一下。", tryWrite:"写下三件值得感谢的小事。", continueChat:"Continue Chat",
    insightsTitle:"Insights", insightsSubtitle:"你的本周情绪", triggerTitle:"Top triggers", localizedTitle:"Localized expression",
    calendarTitle:"Calendar", calendarSubtitle:"回顾你的心情记录", recentTitle:"Recent records",
    chatTitle:"Chat with Moodly", chatSubtitle:"和 Moodly 聊聊", chatHello:"Hi，我在这里。你现在感觉怎么样？", messagePlaceholder:"输入你的想法...",
    settingsSubtitle:"自定义你的体验", profileSub:"让 Moodly 更懂你 💜",
    reminders:"Reminders", theme:"Theme", light:"Light", language:"Language", exportData:"Export Data", privacy:"Privacy", localOnly:"Local", deleteData:"Delete All Data",
    thinking:"Moodly 正在理解你的情绪...", demoEmotion:"平静", demoResponse:"你已经开始照顾自己的感受了，这本身就很重要。", demoSuggestion:"先做 3 次慢呼吸，再给自己 5 分钟休息。",
    stable:"你本周的情绪整体比较平稳。", rising:"你正在逐渐恢复能量，继续保持。", low:"最近低能量记录偏多，建议减少任务负担并保证休息。",
    confirmDelete:"确定要清空所有记录吗？", deleted:"已清空。"
  },
  en: {
    todayTitle:"Today", todaySubtitle:"How are you feeling today?",
    moodQuestion:"How are you feeling?", moodDesc:"Choose the mood that best describes you right now.",
    moodGreat:"Great", moodGood:"Good", moodOkay:"Okay", moodLow:"Low", moodAwful:"Awful",
    noteTitle:"Add a quick note", optional:"(optional)", notePlaceholder:"What's on your mind?", checkIn:"Check In",
    encouragementTitle:"Daily encouragement", todayRecords:"Today records", noRecords:"No records yet. Complete one check-in first.",
    reflectionTitle:"AI Reflection", reflectionSubtitle:"Here's your reflection based on your check-ins.",
    tryTitle:"You might try", tryWalk:"Take a 5-minute walk to clear your mind.", tryWrite:"Write down three things you’re grateful for.", continueChat:"Continue Chat",
    insightsTitle:"Insights", insightsSubtitle:"Your mood this week", triggerTitle:"Top triggers", localizedTitle:"Localized expression",
    calendarTitle:"Calendar", calendarSubtitle:"Review your mood history", recentTitle:"Recent records",
    chatTitle:"Chat with Moodly", chatSubtitle:"Talk with Moodly", chatHello:"Hi, how are you feeling today?", messagePlaceholder:"Type a message...",
    settingsSubtitle:"Customize your experience", profileSub:"Let Moodly understand you better 💜",
    reminders:"Reminders", theme:"Theme", light:"Light", language:"Language", exportData:"Export Data", privacy:"Privacy", localOnly:"Local", deleteData:"Delete All Data",
    thinking:"Moodly is understanding your emotion...", demoEmotion:"Calm", demoResponse:"You are already taking care of your feelings, and that matters.", demoSuggestion:"Take three slow breaths and give yourself five minutes to rest.",
    stable:"Your mood was generally stable this week.", rising:"You are gradually recovering your energy. Keep going.", low:"Low-energy records are appearing more often. Consider reducing your workload and resting.",
    confirmDelete:"Delete all records?", deleted:"Deleted."
  }
};

const MOOD_SCORE = {awful:1, low:2, calm:3, happy:4, great:5};
let currentLang = localStorage.getItem("moodly_lang") || "en";
let selectedMoodKey = "calm";

function t(k){ return I18N[currentLang][k] || I18N.en[k] || k; }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function timeNow(){ return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function getRecords(){ try{return JSON.parse(localStorage.getItem(STORE_KEY)||"[]");}catch(e){return [];} }
function saveRecords(r){ localStorage.setItem(STORE_KEY, JSON.stringify(r)); }
function moodText(key){
  const map = {great:"moodGreat", happy:"moodGood", calm:"moodOkay", low:"moodLow", awful:"moodAwful"};
  return t(map[key]);
}

function applyLanguage(){
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => el.innerHTML = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  document.getElementById("langEN")?.classList.toggle("active", currentLang === "en");
  document.getElementById("langZH")?.classList.toggle("active", currentLang === "zh");
  renderAll();
}
function setLanguage(lang){ currentLang = lang; localStorage.setItem("moodly_lang", lang); applyLanguage(); }

function detectTriggers(note){
  const s = note.toLowerCase();
  const arr = [];
  if(/工作|任务|压力|deadline|work|busy|task/.test(s)) arr.push("work");
  if(/睡|累|疲惫|熬夜|sleep|tired|exhausted/.test(s)) arr.push("sleep");
  if(/朋友|家人|同事|关系|social|friend|family/.test(s)) arr.push("social");
  return arr.length ? arr : ["self"];
}
function triggerLabel(k){
  const zh = {work:"💼 工作压力", sleep:"🌙 睡眠不足", social:"👥 社交能量", self:"🌿 自我状态"};
  const en = {work:"💼 Work stress", sleep:"🌙 Lack of sleep", social:"👥 Social energy", self:"🌿 Self-care"};
  return (currentLang === "zh" ? zh : en)[k] || k;
}
function localReflection(note){
  return {
    emotion:moodText(selectedMoodKey),
    response:t("demoResponse"),
    suggestion:t("demoSuggestion"),
    localized:selectedMoodKey === "low" || selectedMoodKey === "awful"
      ? "I feel emotionally drained today, but I’m trying to stay grounded."
      : "I feel steady and calm today, and I’m trying to stay grounded."
  };
}
function extractText(data){
  if(data?.error?.message) throw new Error(data.error.message);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
function parseAI(text){
  try { return JSON.parse(text.replace(/```json/gi,"").replace(/```/g,"").trim()); }
  catch(e){ return localReflection(""); }
}
async function checkIn(){
  const input = document.getElementById("moodInput");
  let note = input.value.trim();
  const selected = moodText(selectedMoodKey);
  if(!note) note = currentLang === "zh" ? `我现在的心情是：${selected}` : `My current mood is: ${selected}`;

  document.getElementById("todayEncouragement").textContent = t("thinking");

  let result;
  if(!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"){
    result = localReflection(note);
  }else{
    const prompt = `You are Moodly AI, a gentle emotional companion. Do not diagnose.
Language: ${currentLang === "zh" ? "Chinese" : "English"}
Mood: ${selected}
Note: ${note}
Return strict JSON: {"emotion":"","response":"","suggestion":"","localized":""}`;
    try{
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      result = parseAI(extractText(await res.json()));
    }catch(e){
      result = localReflection(note);
    }
  }

  const record = {
    id:Date.now(),
    date:todayISO(),
    time:timeNow(),
    mood:selectedMoodKey,
    score:MOOD_SCORE[selectedMoodKey],
    note,
    reflection:result.response,
    suggestion:result.suggestion,
    localized:result.localized,
    triggers:detectTriggers(note)
  };

  const records = getRecords();
  records.unshift(record);
  saveRecords(records.slice(0,120));

  document.getElementById("todayEncouragement").textContent = result.response;
  document.getElementById("reflectionHeadline").textContent = result.emotion || selected;
  document.getElementById("reflectionBody").textContent = result.response;
  input.value = "";
  document.getElementById("charCount").textContent = "0";
  renderAll();
  switchScreen("reflection");
}
function last7Dates(){
  const arr = [];
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    arr.push(d.toISOString().slice(0,10));
  }
  return arr;
}
function avgScore(date){
  const r = getRecords().filter(x => x.date === date);
  return r.length ? r.reduce((s,x)=>s+x.score,0)/r.length : null;
}
function recordsLastDays(n){
  const min = new Date();
  min.setDate(min.getDate()-(n-1));
  return getRecords().filter(r => new Date(r.date) >= new Date(min.toISOString().slice(0,10)));
}
function renderToday(){
  const list = getRecords().filter(r => r.date === todayISO());
  document.getElementById("todayCount").textContent = list.length;
  document.getElementById("todayList").innerHTML = list.length
    ? list.slice(0,3).map(r=>`<div class="record-item"><strong>${moodText(r.mood)}<small>${r.time}</small></strong>${escapeHTML(r.note)}</div>`).join("")
    : `<div class="record-item">${t("noRecords")}</div>`;
}
function renderInsights(){
  const chart = document.getElementById("moodChart");
  if(!chart) return;
  const dates = last7Dates();
  const scores = dates.map(avgScore);
  const points = scores.map((s,i)=>{
    const v = s || 3;
    return {x:25+i*45, y:130-((v-1)/4)*90};
  });
  chart.innerHTML =
    `<line x1="20" y1="130" x2="300" y2="130"></line>` +
    `<polyline points="${points.map(p=>`${p.x},${p.y}`).join(" ")}"></polyline>` +
    points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5"></circle>`).join("");
  document.getElementById("weekLabels").innerHTML = dates.map(d=>`<span>${new Date(d).toLocaleDateString(currentLang==="zh"?"zh-CN":"en-US",{weekday:"short"}).slice(0,3)}</span>`).join("");
  const actual = scores.filter(Boolean);
  let summary = t("stable");
  if(actual.length >= 2){
    if(actual.at(-1)-actual[0] > .8) summary = t("rising");
    if(actual.filter(s=>s<=2).length>=2) summary = t("low");
  }
  document.getElementById("weeklySummary").textContent = summary;
  const counts = {};
  recordsLastDays(14).forEach(r => (r.triggers||[]).forEach(k => counts[k]=(counts[k]||0)+1));
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,4);
  document.getElementById("triggerChips").innerHTML = sorted.length
    ? sorted.map(([k,v])=>`<span>${triggerLabel(k)} · ${v}</span>`).join("")
    : `<span>${triggerLabel("self")}</span>`;
  document.getElementById("localizedExpression").textContent = getRecords()[0]?.localized || "I feel emotionally aware today, and I’m learning to understand myself with more kindness.";
}
function renderCalendar(){
  const grid = document.getElementById("calendarGrid");
  if(!grid) return;
  const d = new Date();
  document.getElementById("calendarMonth").textContent = d.toLocaleDateString(currentLang==="zh"?"zh-CN":"en-US",{month:"long",year:"numeric"});
  const week = ["mon","tue","wed","thu","fri","sat","sun"].map(k=>`<b>${weekdayText(k)}</b>`).join("");
  const y = d.getFullYear(), m = d.getMonth();
  const first = new Date(y,m,1);
  const last = new Date(y,m+1,0).getDate();
  let html = week + "<i></i>".repeat((first.getDay()+6)%7);
  for(let day=1; day<=last; day++){
    const date = new Date(y,m,day).toISOString().slice(0,10);
    const score = avgScore(date);
    let cls = "";
    if(score !== null) cls = score<=1.5 ? "awful" : score<=2.5 ? "low" : score<=3.5 ? "mid" : "good";
    html += `<i class="${cls}">${day}</i>`;
  }
  grid.innerHTML = html;
  const recent = getRecords().slice(0,5);
  document.getElementById("recentList").innerHTML = recent.length
    ? recent.map(r=>`<div class="record-item"><strong>${moodText(r.mood)}<small>${r.date}</small></strong>${escapeHTML(r.note)}</div>`).join("")
    : `<div class="record-item">${t("noRecords")}</div>`;
}
function weekdayText(k){
  if(currentLang === "zh") return {mon:"一",tue:"二",wed:"三",thu:"四",fri:"五",sat:"六",sun:"日"}[k];
  return {mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun"}[k];
}
function renderChat(){
  const chat = document.getElementById("chatMessages");
  if(!chat || chat.dataset.ready) return;
  chat.dataset.ready = "1";
  const latest = getRecords()[0];
  if(latest) chat.innerHTML += `<div class="bubble left">${escapeHTML(latest.reflection)}</div>`;
}
function renderAll(){ renderToday(); renderInsights(); renderCalendar(); renderChat(); }
function escapeHTML(s){ return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
function exportData(){
  const blob = new Blob([JSON.stringify(getRecords(), null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "moodly-records.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
function deleteData(){
  if(confirm(t("confirmDelete"))){
    localStorage.removeItem(STORE_KEY);
    renderAll();
    alert(t("deleted"));
  }
}
function switchScreen(target){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(target).classList.add("active");
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("active", b.dataset.screen===target));
  document.getElementById("messageBox").classList.toggle("show", target === "chat");
  renderAll();
}
function init(){
  document.querySelectorAll("[data-mood-key]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-mood-key]").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMoodKey = btn.dataset.moodKey;
  }));
  document.querySelectorAll("[data-screen]").forEach(btn => btn.addEventListener("click", () => switchScreen(btn.dataset.screen)));
  document.querySelectorAll("[data-screen-jump]").forEach(btn => btn.addEventListener("click", () => switchScreen(btn.dataset.screenJump)));
  document.getElementById("checkInBtn").addEventListener("click", checkIn);
  document.getElementById("moodInput").addEventListener("input", e => document.getElementById("charCount").textContent = e.target.value.length);
  document.getElementById("langEN").addEventListener("click", () => setLanguage("en"));
  document.getElementById("langZH").addEventListener("click", () => setLanguage("zh"));
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("deleteBtn").addEventListener("click", deleteData);
  document.getElementById("chatSend").addEventListener("click", () => {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if(!text) return;
    document.getElementById("chatMessages").innerHTML += `<div class="bubble right">${escapeHTML(text)}</div><div class="bubble left">${currentLang==="zh"?"我听到了。我们可以先把这件事拆成一个更小的部分。":"I hear you. Let’s break it into one smaller piece first."}</div>`;
    input.value = "";
  });
  applyLanguage();
}
if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js?v=14").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded", init);

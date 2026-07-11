const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const STORE_KEY = "moodly_final_v16";

const T = {
  en: {
    todayTitle:"Today", todaySub:"How are you feeling?", moodTitle:"How are you feeling?",
    great:"Great", good:"Good", okay:"Okay", low:"Low", awful:"Awful",
    noteTitle:"Add a quick note", optional:"(optional)", notePlaceholder:"What's on your mind?", checkIn:"Check In",
    dailyTitle:"Daily encouragement", reflectionIntro:"Here's your reflection<br/>based on your check-ins.",
    tryTitle:"You might try", tryWalk:"Take a 5-minute walk<br/>to clear your mind.", tryJournal:"Write down three things<br/>you're grateful for.",
    moodWeek:"Your mood this week", chatTitle:"Chat with Moodly", chatHello:"Hi Alex, how are you feeling today?", chatReply:"That's understandable. Want to talk through what's on your mind?",
    preferences:"Preferences", reminders:"Reminders", theme:"Theme", light:"Light", general:"General", language:"Language", delete:"Delete All Data", messagePlaceholder:"Type a message...",
    defaultReflection:"You're showing up for yourself, and that matters.", headline:"You've been feeling mostly calm this week."
  },
  zh: {
    todayTitle:"Today", todaySub:"你现在感觉怎么样？", moodTitle:"你现在感觉怎么样？",
    great:"很好", good:"开心", okay:"平静", low:"低落", awful:"很糟糕",
    noteTitle:"快速记录", optional:"（可选）", notePlaceholder:"你现在在想什么？", checkIn:"Check In",
    dailyTitle:"每日鼓励", reflectionIntro:"这是基于你记录生成的<br/>AI 温柔反思。",
    tryTitle:"你可以试试", tryWalk:"花 5 分钟散步<br/>让大脑放松一下。", tryJournal:"写下三件<br/>值得感谢的小事。",
    moodWeek:"你的本周情绪", chatTitle:"Chat with Moodly", chatHello:"Hi，我在这里。你现在感觉怎么样？", chatReply:"这很能理解。要不要聊聊你现在在想什么？",
    preferences:"Preferences", reminders:"Reminders", theme:"Theme", light:"Light", general:"General", language:"Language", delete:"Delete All Data", messagePlaceholder:"输入你的想法...",
    defaultReflection:"你已经开始照顾自己的感受了，这本身就很重要。", headline:"你这周整体保持得比较平稳。"
  }
};

let lang = localStorage.getItem("moodly_lang") || "en";
let mood = "okay";

function tr(k){ return T[lang][k] || T.en[k] || k; }
function records(){ try{return JSON.parse(localStorage.getItem(STORE_KEY)||"[]")}catch(e){return []} }
function saveRecords(r){ localStorage.setItem(STORE_KEY, JSON.stringify(r)); }
function applyLang(){
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => el.innerHTML = tr(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => el.placeholder = tr(el.dataset.i18nPlaceholder));
  document.getElementById("langEN").classList.toggle("active", lang === "en");
  document.getElementById("langZH").classList.toggle("active", lang === "zh");
}
function switchScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("active", b.dataset.screen === id));
  document.getElementById("messageBox").classList.toggle("show", id === "chat");
  drawChart();
}
function drawChart(){
  const chart = document.getElementById("chart");
  if(!chart) return;
  const pts = [[20,118],[62,82],[104,104],[146,94],[188,88],[230,52],[272,102],[310,67]];
  chart.innerHTML = `
    <line x1="20" y1="50" x2="310" y2="50"></line>
    <line x1="20" y1="94" x2="310" y2="94"></line>
    <line x1="20" y1="138" x2="310" y2="138"></line>
    <polyline points="${pts.map(p=>p.join(",")).join(" ")}"></polyline>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="10"></circle>`).join("")}
  `;
}
function fillCalendar(){
  const grid = document.getElementById("calendarGrid");
  if(!grid) return;
  const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  let html = weekdays.map(d=>`<b>${d}</b>`).join("");
  for(let i=0;i<3;i++) html += "<span></span>";
  for(let d=1; d<=31; d++){
    let cls = "";
    if(d === 6) cls = "dot";
    if(d === 14) cls = "soft";
    if(d === 20) cls = "orange";
    if(d === 27) cls = "selected";
    html += `<i class="${cls}">${d}</i>`;
  }
  grid.innerHTML = html;
}
async function checkIn(){
  const noteInput = document.getElementById("noteInput");
  const note = noteInput.value.trim();
  let response = tr("defaultReflection");
  let headline = tr("headline");
  if(GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY"){
    const prompt = `You are Moodly AI, a gentle emotional companion. Do not diagnose. Mood: ${mood}. Note: ${note || "No note"}. Return JSON {"headline":"","response":""}`;
    try{
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      headline = parsed.headline || headline;
      response = parsed.response || response;
    }catch(e){}
  }
  document.getElementById("reflectionHeadline").textContent = headline;
  document.getElementById("reflectionBody").textContent = response;
  document.getElementById("encouragementText").innerHTML = response;
  const r = records();
  r.unshift({time:Date.now(), mood, note, response});
  saveRecords(r.slice(0,100));
  noteInput.value = "";
  document.getElementById("count").textContent = "0";
  switchScreen("reflection");
}
function init(){
  document.querySelectorAll(".mood").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".mood").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    mood = btn.dataset.mood;
  }));
  document.querySelectorAll("[data-screen]").forEach(btn=>btn.addEventListener("click",()=>switchScreen(btn.dataset.screen)));
  document.querySelectorAll("[data-screen-jump]").forEach(btn=>btn.addEventListener("click",()=>switchScreen(btn.dataset.screenJump)));
  document.getElementById("noteInput").addEventListener("input", e=>document.getElementById("count").textContent = e.target.value.length);
  document.getElementById("checkBtn").addEventListener("click", checkIn);
  document.getElementById("langEN").addEventListener("click",()=>{lang="en";localStorage.setItem("moodly_lang",lang);applyLang();});
  document.getElementById("langZH").addEventListener("click",()=>{lang="zh";localStorage.setItem("moodly_lang",lang);applyLang();});
  document.getElementById("sendBtn").addEventListener("click",()=>{
    const input = document.getElementById("chatInput");
    const msg = input.value.trim();
    if(!msg) return;
    document.getElementById("chatArea").insertAdjacentHTML("beforeend", `<div class="bubble user">${msg.replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</div><div class="bubble ai">${lang==="zh"?"我听到了。先慢慢来，我们可以一步一步说。":"I hear you. We can take it slowly, one step at a time."}</div>`);
    input.value = "";
  });
  document.getElementById("deleteBtn").addEventListener("click",()=>{localStorage.removeItem(STORE_KEY); alert(lang==="zh" ? "已清空" : "Deleted");});
  fillCalendar();
  drawChart();
  applyLang();
}
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js?v=16").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded", init);

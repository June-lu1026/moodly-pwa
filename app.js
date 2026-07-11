const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const STORAGE_KEY = "moodly_records_v23";

let lang = localStorage.getItem("moodly_lang") || "en";
let selectedMood = "okay";
let currentMonth = new Date();
let selectedDateKey = dateKey(new Date());

const moodScore = {awful:1, low:2, okay:3, good:4, great:5};
const moodClass = {great:"face-great", good:"face-good", okay:"face-okay", low:"face-low", awful:"face-awful"};
const moodName = {
  en:{great:"Great", good:"Good", okay:"Okay", low:"Low", awful:"Awful"},
  zh:{great:"很好", good:"开心", okay:"平静", low:"低落", awful:"很糟糕"}
};

const T = {
  en:{
    today:"Today", todaySub:"How are you feeling?", moodTitle:"How are you feeling?",
    great:"Great", good:"Good", okay:"Okay", low:"Low", awful:"Awful",
    noteTitle:"Add a quick note", optional:"(optional)", notePh:"What's on your mind?", check:"Check In",
    daily:"Daily encouragement", recent:"Recent records",
    reflectIntro:"Here's your reflection<br>based on your check-ins.",
    suggestions:"Suggestions for you", selfCompassion:"Practice self-compassion", kindToday:"Be kind to yourself today.", journal:"Write in your journal", gainClarity:"Reflect to gain clarity.",
    weekMood:"Your mood this week", recordStats:"Record stats", total:"Total", streak:"Streak", most:"Most",
    chatTitle:"Chat with Moodly", chatHi:"Hi, I'm here to listen and support you. How are you feeling today?",
    prefs:"Preferences", reminders:"Reminders", theme:"Theme", light:"Light", general:"General", language:"Language", delete:"Delete All Data", msgPh:"Type a message...",
    noRecord:"No record", noNote:"Your check-in will appear here.", saved:"Saved",
    defaultReflect:"It's okay to take things slow — you're still moving forward."
  },
  zh:{
    today:"Today", todaySub:"你现在感觉怎么样？", moodTitle:"你现在感觉怎么样？",
    great:"很好", good:"开心", okay:"平静", low:"低落", awful:"很糟糕",
    noteTitle:"快速记录", optional:"（可选）", notePh:"你现在在想什么？", check:"Check In",
    daily:"每日鼓励", recent:"最近记录",
    reflectIntro:"这是基于你记录生成的<br>AI 温柔反思。",
    suggestions:"给你的建议", selfCompassion:"温柔对待自己", kindToday:"今天对自己友好一点。", journal:"写下今日感受", gainClarity:"用记录理清想法。",
    weekMood:"你的本周情绪", recordStats:"记录统计", total:"总数", streak:"连续", most:"最多",
    chatTitle:"Chat with Moodly", chatHi:"Hi，我在这里听你说。你现在感觉怎么样？",
    prefs:"Preferences", reminders:"Reminders", theme:"Theme", light:"Light", general:"General", language:"Language", delete:"Delete All Data", msgPh:"输入你的想法...",
    noRecord:"暂无记录", noNote:"你的情绪记录会显示在这里。", saved:"已保存",
    defaultReflect:"你已经开始照顾自己的感受了，这本身就很重要。"
  }
};

function t(k){return T[lang][k] || T.en[k] || k;}
function records(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch(e){return []}}
function saveRecords(r){localStorage.setItem(STORAGE_KEY, JSON.stringify(r))}
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function label(m){return moodName[lang][m] || m}
function fmtDate(key){
  const [y,m,d]=key.split("-").map(Number);
  const dt=new Date(y,m-1,d);
  return dt.toLocaleDateString(lang==="zh"?"zh-CN":"en-US",{month:"short",day:"numeric",year:"numeric"});
}

function applyLang(){
  document.documentElement.lang = lang==="zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el=>el.innerHTML=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  document.getElementById("enBtn").classList.toggle("active",lang==="en");
  document.getElementById("zhBtn").classList.toggle("active",lang==="zh");
  renderAll();
}

function switchScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("active", b.dataset.screen===id));
  document.getElementById("messagebar").classList.toggle("show", id==="chat");
  renderAll();
}

function reflectionFor(mood,note){
  const base = lang==="zh" ? {
    great:"你今天的状态很轻盈。记得把这种感觉保存下来，它会成为之后的能量。",
    good:"你正在用稳定的方式照顾自己。继续保持这种温柔的节奏。",
    okay:"平静本身也是一种很好的状态。你不需要每天都很用力。",
    low:"今天有些低落也没关系。先做一件很小的事，让自己慢慢回来。",
    awful:"今天可能真的不容易。请先允许自己慢一点，你已经做得很好了。"
  } : {
    great:"Your energy feels bright today. Let yourself enjoy this small moment of ease.",
    good:"You're taking care of yourself in a steady way. Keep this gentle rhythm.",
    okay:"Calm is a meaningful state too. You don't need to push hard every day.",
    low:"It's okay to feel low. Start with one small thing and let yourself return slowly.",
    awful:"Today may feel heavy. Please give yourself permission to slow down — you're still trying."
  };
  if(note) return base[mood] + (lang==="zh" ? " 我也注意到你写下了自己的感受，这很重要。" : " Naming what you feel is already a caring step.");
  return base[mood];
}

async function checkIn(){
  const btn=document.getElementById("checkBtn");
  const note=document.getElementById("noteInput").value.trim();
  btn.classList.add("loading");
  btn.textContent = lang==="zh" ? "记录中..." : "Saving...";
  let response = reflectionFor(selectedMood,note);

  if(GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY"){
    try{
      const prompt = `You are Moodly AI, a gentle emotional companion. No diagnosis. Mood: ${selectedMood}. Note: ${note || "No note"}. Write one short warm reflection under 38 words.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      response = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || response;
    }catch(e){}
  }

  const r = records();
  r.unshift({id:Date.now(), date:dateKey(new Date()), time:new Date().toISOString(), mood:selectedMood, note, response});
  saveRecords(r.slice(0,200));

  document.getElementById("reflectHeadline").textContent = lang==="zh" ? `你今天感觉${label(selectedMood)}。` : `You've been feeling ${label(selectedMood).toLowerCase()} today.`;
  document.getElementById("reflectBody").textContent = response;
  document.getElementById("dailyCopy").innerHTML = response;
  document.getElementById("noteInput").value="";
  document.getElementById("noteCount").textContent="0";
  btn.classList.remove("loading");
  btn.textContent=t("check");
  selectedDateKey = dateKey(new Date());
  switchScreen("reflection");
}

function renderRecent(){
  const wrap=document.getElementById("recentWrap");
  const list=document.getElementById("recentList");
  const r=records().slice(0,6);
  wrap.classList.toggle("show", r.length>0);
  list.innerHTML = r.map(item=>`
    <button class="record-pill" type="button" data-date="${item.date}">
      <b>${label(item.mood)} · ${fmtDate(item.date)}</b>
      <small>${new Date(item.time).toLocaleTimeString(lang==="zh"?"zh-CN":"en-US",{hour:"2-digit",minute:"2-digit"})}</small>
      <p>${item.note || item.response}</p>
    </button>
  `).join("");
  list.querySelectorAll(".record-pill").forEach(btn=>btn.addEventListener("click",()=>{
    selectedDateKey=btn.dataset.date;
    switchScreen("calendar");
  }));
}

function renderCalendar(){
  const grid=document.getElementById("calendarGrid");
  const title=document.getElementById("monthTitle");
  const year=currentMonth.getFullYear(), month=currentMonth.getMonth();
  title.textContent=currentMonth.toLocaleDateString(lang==="zh"?"zh-CN":"en-US",{month:"long",year:"numeric"});
  const map={};
  records().forEach(r=>{ if(!map[r.date]) map[r.date]=r; });
  const first=new Date(year,month,1);
  const daysInMonth=new Date(year,month+1,0).getDate();
  const mondayIndex=(first.getDay()+6)%7;
  let html=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<b>${d}</b>`).join("");
  for(let i=0;i<mondayIndex;i++) html+="<span></span>";
  for(let d=1; d<=daysInMonth; d++){
    const key=dateKey(new Date(year,month,d));
    const rec=map[key];
    const cls=[rec?"has "+rec.mood:"", key===selectedDateKey?"active":""].join(" ");
    html+=`<i class="${cls}" data-date="${key}">${d}</i>`;
  }
  grid.innerHTML=html;
  grid.querySelectorAll("i[data-date]").forEach(el=>el.addEventListener("click",()=>{
    selectedDateKey=el.dataset.date;
    renderCalendar();
  }));
  const rec=records().find(r=>r.date===selectedDateKey);
  document.getElementById("selectedDateTitle").textContent=fmtDate(selectedDateKey);
  const face=document.getElementById("selectedMoodFace");
  face.className="face " + (rec ? moodClass[rec.mood] : "face-okay");
  document.getElementById("selectedMoodLabel").textContent=rec ? label(rec.mood) : t("noRecord");
  document.getElementById("selectedNote").textContent=rec ? (rec.note || rec.response) : t("noNote");
}

function renderInsights(){
  const r=records();
  const today=new Date();
  const days=[];
  for(let i=6;i>=0;i--){ const d=new Date(today); d.setDate(today.getDate()-i); days.push(dateKey(d)); }
  const dayScores=days.map(k=>{
    const rec=r.find(x=>x.date===k);
    return rec ? moodScore[rec.mood] : null;
  });
  const fallback=[3,4,3.4,3.7,4.1,3.5,4.4];
  const scores=dayScores.map((v,i)=>v||fallback[i]);
  const xs=scores.map((_,i)=>16+i*(288/6));
  const ys=scores.map(v=>142-(v-1)*(90/4));
  const points=xs.map((x,i)=>`${x},${ys[i]}`).join(" ");
  const svg=document.getElementById("trendChart");
  svg.innerHTML=`
    <line x1="16" y1="54" x2="304" y2="54"></line>
    <line x1="16" y1="98" x2="304" y2="98"></line>
    <line x1="16" y1="142" x2="304" y2="142"></line>
    <polyline points="${points}"></polyline>
    ${xs.map((x,i)=>`<circle cx="${x}" cy="${ys[i]}" r="7"></circle>`).join("")}
  `;
  document.getElementById("statTotal").textContent=r.length;
  document.getElementById("statStreak").textContent=streakCount(r);
  const counts={great:0,good:0,okay:0,low:0,awful:0};
  r.forEach(x=>counts[x.mood]++);
  const top=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
  document.getElementById("statTop").textContent=r.length?label(top):"—";
  document.getElementById("insightSummary").textContent = r.length
    ? (lang==="zh" ? `你已经记录了 ${r.length} 次情绪。继续保持这个轻量的小习惯。` : `You've logged ${r.length} check-ins. Your patterns are starting to become visible.`)
    : (lang==="zh" ? "完成第一次 Check In 后，这里会显示你的情绪趋势。" : "Your mood trend will appear after your first check-in.");
}

function streakCount(r){
  const set=new Set(r.map(x=>x.date));
  let count=0; const d=new Date();
  while(set.has(dateKey(d))){ count++; d.setDate(d.getDate()-1); }
  return count;
}

function renderAll(){
  renderRecent();
  renderCalendar();
  renderInsights();
}

function sendMessage(){
  const input=document.getElementById("chatInput");
  const msg=input.value.trim();
  if(!msg) return;
  const list=document.getElementById("chatList");
  list.insertAdjacentHTML("beforeend", `<div class="bubble user">${msg.replace(/[&<>]/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</div><div class="typing" id="typing"><i></i><i></i><i></i></div>`);
  input.value="";
  setTimeout(()=>{
    document.getElementById("typing")?.remove();
    const reply=lang==="zh" ? "我听到了。我们可以慢慢说，不需要一次解决所有事情。" : "I hear you. We can take it slowly — you don't have to solve everything at once.";
    list.insertAdjacentHTML("beforeend", `<div class="bubble bot">${reply}</div>`);
    list.scrollTop=list.scrollHeight;
  },650);
}

function init(){
  document.querySelectorAll(".tabbar button").forEach(b=>b.addEventListener("click",()=>switchScreen(b.dataset.screen)));
  document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>switchScreen(b.dataset.open)));
  document.querySelectorAll(".mood").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll(".mood").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    selectedMood=b.dataset.mood;
  }));
  document.getElementById("noteInput").addEventListener("input",e=>document.getElementById("noteCount").textContent=e.target.value.length);
  document.getElementById("checkBtn").addEventListener("click",checkIn);
  document.getElementById("sendBtn").addEventListener("click",sendMessage);
  document.getElementById("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter") sendMessage();});
  document.getElementById("prevMonth").addEventListener("click",()=>{currentMonth.setMonth(currentMonth.getMonth()-1);renderCalendar();});
  document.getElementById("nextMonth").addEventListener("click",()=>{currentMonth.setMonth(currentMonth.getMonth()+1);renderCalendar();});
  document.getElementById("deleteBtn").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);renderAll();alert(lang==="zh"?"已清空":"Deleted");});
  document.getElementById("enBtn").addEventListener("click",()=>{lang="en";localStorage.setItem("moodly_lang",lang);applyLang();});
  document.getElementById("zhBtn").addEventListener("click",()=>{lang="zh";localStorage.setItem("moodly_lang",lang);applyLang();});
  applyLang();
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js?v=23").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded",init);

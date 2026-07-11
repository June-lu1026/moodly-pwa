const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const STORE_KEY = "moodly_final_design_match_v19";
let lang = localStorage.getItem("moodly_lang") || "en";
let selectedMood = "okay";

const TEXT = {
  en: {
    today:"Today", todaySub:"How are you feeling?", moodTitle:"How are you feeling?",
    great:"Great", good:"Good", okay:"Okay", low:"Low", awful:"Awful",
    noteTitle:"Add a quick note", optional:"(optional)", notePh:"What's on your mind?", checkIn:"Check In",
    daily:"Daily encouragement",
    reflectIntro:"Here's your reflection<br>based on your check-ins.",
    tryTitle:"You might try", tryWalk:"Take a 5-minute walk", tryWalkSub:"Clear your mind gently.", tryWrite:"Write in your journal", tryWriteSub:"Name one thing you did well.",
    weekMood:"Your mood this week", chatTitle:"Chat with Moodly", chatHi:"Hi Alex, how are you feeling today?", chatReply:"That's understandable. Want to talk through what's on your mind?",
    prefs:"Preferences", reminders:"Reminders", theme:"Theme", light:"Light", general:"General", language:"Language", delete:"Delete All Data", messagePh:"Type a message...",
    headline:"You've been feeling mostly calm this week.", response:"You're showing up for yourself, and that matters."
  },
  zh: {
    today:"Today", todaySub:"你现在感觉怎么样？", moodTitle:"你现在感觉怎么样？",
    great:"很好", good:"开心", okay:"平静", low:"低落", awful:"很糟糕",
    noteTitle:"快速记录", optional:"（可选）", notePh:"你现在在想什么？", checkIn:"Check In",
    daily:"每日鼓励",
    reflectIntro:"这是基于你记录生成的<br>AI 温柔反思。",
    tryTitle:"你可以试试", tryWalk:"花 5 分钟散步", tryWalkSub:"让大脑放松一下。", tryWrite:"写下今日小事", tryWriteSub:"记录一件你做得不错的事。",
    weekMood:"你的本周情绪", chatTitle:"Chat with Moodly", chatHi:"Hi，我在这里。你现在感觉怎么样？", chatReply:"这很能理解。要不要聊聊你现在在想什么？",
    prefs:"Preferences", reminders:"Reminders", theme:"Theme", light:"Light", general:"General", language:"Language", delete:"Delete All Data", messagePh:"输入你的想法...",
    headline:"你这周整体保持得比较平稳。", response:"你已经开始照顾自己的感受了，这本身就很重要。"
  }
};

function t(key){ return TEXT[lang][key] || TEXT.en[key] || key; }

function applyLang(){
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => el.innerHTML = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  const en = document.getElementById("enBtn");
  const zh = document.getElementById("zhBtn");
  if(en && zh){
    en.classList.toggle("active", lang === "en");
    zh.classList.toggle("active", lang === "zh");
  }
}

function switchScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".tabbar button").forEach(btn => btn.classList.toggle("active", btn.dataset.screen === id));
  document.getElementById("messageBar").classList.toggle("show", id === "chat");
}

async function checkIn(){
  const noteEl = document.getElementById("moodNote");
  const note = noteEl.value.trim();
  let headline = t("headline");
  let response = t("response");

  if(GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY"){
    try{
      const prompt = `You are Moodly AI, a gentle emotional companion. Do not diagnose. Mood: ${selectedMood}. Note: ${note || "No note"}. Return strict JSON {"headline":"","response":""}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      headline = parsed.headline || headline;
      response = parsed.response || response;
    }catch(e){}
  }

  document.getElementById("reflectHeadline").textContent = headline;
  document.getElementById("reflectBody").textContent = response;
  document.getElementById("dailyText").innerHTML = response;
  localStorage.setItem(STORE_KEY, JSON.stringify({mood:selectedMood,note,response,time:Date.now()}));

  noteEl.value = "";
  document.getElementById("charCount").textContent = "0";
  switchScreen("reflection");
}

function sendChat(){
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if(!msg) return;
  const safe = msg.replace(/[&<>]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]));
  document.getElementById("chatList").insertAdjacentHTML("beforeend",
    `<div class="bubble user">${safe}</div><div class="bubble bot">${lang === "zh" ? "我听到了。我们可以慢慢说，不需要一次解决所有事情。" : "I hear you. We can take it slowly — you don't have to solve everything at once."}</div>`
  );
  input.value = "";
}

function init(){
  document.querySelectorAll("[data-screen]").forEach(btn => btn.addEventListener("click", () => switchScreen(btn.dataset.screen)));
  document.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => switchScreen(btn.dataset.open)));

  document.querySelectorAll(".mood").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".mood").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMood = btn.dataset.mood;
  }));

  document.getElementById("moodNote").addEventListener("input", e => {
    document.getElementById("charCount").textContent = e.target.value.length;
  });
  document.getElementById("checkInBtn").addEventListener("click", checkIn);
  document.getElementById("sendBtn").addEventListener("click", sendChat);
  document.getElementById("deleteBtn").addEventListener("click", () => {
    localStorage.removeItem(STORE_KEY);
    alert(lang === "zh" ? "已清空" : "Deleted");
  });
  document.getElementById("enBtn").addEventListener("click", () => {
    lang = "en";
    localStorage.setItem("moodly_lang", lang);
    applyLang();
  });
  document.getElementById("zhBtn").addEventListener("click", () => {
    lang = "zh";
    localStorage.setItem("moodly_lang", lang);
    applyLang();
  });

  applyLang();
}

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js?v=19").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded", init);

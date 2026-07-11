const app = document.getElementById('app');
const nav = document.getElementById('bottomNav');
const state = {
  page: 'today',
  mood: localStorage.getItem('moodlyMood') || 'Okay',
  note: localStorage.getItem('moodlyNote') || '',
  messages: [],
  aiReflection: '',
  aiInsight: ''
};
const moods = [
  ['Great','m1','smile'],['Good','m2','smile'],['Okay','m3','flat'],['Low','m4','sad'],['Awful','m5','cry']
];
const icons = {
  calendar:`<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>`,
  sparkle:`<svg viewBox="0 0 24 24"><path d="m12 2 2.2 6.2L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10l5.8-1.8z"/></svg>`,
  home:`<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>`,
  insights:`<svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>`,
  chat:`<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>`,
  settings:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.5 1A7 7 0 0 0 14.8 6L14.5 3h-5l-.3 3A7 7 0 0 0 7.6 7L5 6 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5L5 18l2.6-1a7 7 0 0 0 1.6 1l.3 3h5l.3-3a7 7 0 0 0 1.6-1l2.5 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z"/></svg>`
};
function logo(){return `<img class="logo" src="assets/icon.svg" alt="Moodly"/>`}
function face(type){
  const base = `<circle cx="11" cy="13" r="1.2" fill="#12366c" stroke="none"/><circle cx="22" cy="13" r="1.2" fill="#12366c" stroke="none"/>`;
  if(type==='smile') return `<svg viewBox="0 0 33 33">${base}<path d="M10 20c4 5 9 5 13 0"/></svg>`;
  if(type==='flat') return `<svg viewBox="0 0 33 33">${base}<path d="M11 21h11"/></svg>`;
  if(type==='sad') return `<svg viewBox="0 0 33 33">${base}<path d="M10 23c4-4 9-4 13 0"/></svg>`;
  return `<svg viewBox="0 0 33 33">${base}<path d="M10 23c4-5 9-5 13 0"/><path d="M7 18v5M26 18v5"/></svg>`;
}
function orb(cls=''){return `<div class="orb ${cls}"><span class="spark">✦</span><span class="smile"></span></div>`}
const navItems=[['today','Today',icons.home],['calendar','Calendar',icons.calendar],['insights','Insights',icons.insights],['chat','Chat',icons.chat],['settings','Settings',icons.settings]];
function renderNav(){nav.innerHTML=navItems.map(([id,label,svg])=>`<button class="nav-btn ${state.page===id?'active':''}" data-page="${id}">${svg}<span>${label}</span></button>`).join('');nav.querySelectorAll('button').forEach(b=>b.onclick=()=>go(b.dataset.page));}
function go(page){state.page=page;render();}
function header(title,action=''){return `<div class="page-head"><div class="brand-title">${logo()}${title?`<div class="head-title">${title}</div>`:''}</div>${action}</div>`}
function today(){return `<div class="page">${header('',`<button class="icon-btn" data-go="calendar" aria-label="Calendar">${icons.calendar}</button>`)}<h1>Today</h1><p class="subtitle">How are you feeling?</p><div class="mood-row">${moods.map(([name,c,t])=>`<button class="mood-item ${state.mood===name?'active':''}" data-mood="${name}"><div class="mood-face ${c}">${face(t)}</div><span>${name}</span></button>`).join('')}</div><div class="card note-card"><div class="note-label">Add a quick note <span class="optional">(optional)</span></div><div class="note-box"><textarea id="note" maxlength="80" placeholder="What's on your mind?">${state.note}</textarea><span class="counter"><b id="count">${state.note.length}</b>/80</span></div><button class="primary" id="checkin">Check In&nbsp;&nbsp; ✦</button></div><div class="card daily"><div><div class="eyebrow">Daily encouragement</div><p>Small steps today,<br/>big changes tomorrow.</p></div>${orb('small')}</div></div>`}
function reflection(){
  const fallback={Great:'Your energy feels bright today. Take a moment to notice what helped.',Good:'You seem steady and positive today. Let this feeling support your next small step.',Okay:'Calm is a meaningful state too. You don’t need to push hard every day. Naming what you feel is already a caring step.',Low:'A low day does not define you. Give yourself permission to move gently and ask for support.',Awful:'This sounds really hard. You deserve care, rest, and support right now.'}[state.mood];
  const copy=state.aiReflection || fallback;
  return `<div class="page">${header('',`<button class="icon-btn">${icons.sparkle}</button>`)}<h1 style="font-size:30px">AI Reflection</h1><p class="reflect-intro">Here’s your reflection<br/>based on your check-ins.</p><div class="card reflect-card"><div class="reflect-copy"><h3>You’ve been feeling<br/><strong>${state.mood.toLowerCase()} today.</strong></h3><p id="reflectionText">${copy}</p></div>${orb('')}</div><div class="suggestions"><h2>Suggestions for you</h2><div class="card suggestion"><div class="bubble-icon">♧</div><div class="copy"><strong>Practice self-compassion</strong><small>Be kind to yourself today.</small></div><span class="chev">›</span></div><div class="card suggestion"><div class="bubble-icon">▤</div><div class="copy"><strong>Write in your journal</strong><small>Reflect to gain clarity.</small></div><span class="chev">›</span></div></div></div>`}
function insights(){return `<div class="page">${header('Insights',`<button class="icon-btn" data-go="calendar">${icons.calendar}</button>`)}<h2>Your mood this week</h2><div class="card chart-card"><div class="chart-grid"><div class="legend">${moods.map(([n,c,t])=>`<div class="legend-row"><span class="dotface ${c}">${n[0]}</span>${n}</div>`).join('')}</div><div class="chart-wrap"><svg viewBox="0 0 260 250" aria-label="Mood trend chart"><g stroke="#e6e7f2" stroke-dasharray="4 4"><path d="M10 35H250M10 80H250M10 125H250M10 170H250M10 215H250"/><path d="M10 20V220M50 20V220M90 20V220M130 20V220M170 20V220M210 20V220M250 20V220"/></g><path d="M10 158 C35 130,52 55,83 75 S120 168,150 142 S190 88,212 121 S235 169,250 84" fill="none" stroke="#7656ff" stroke-width="4" stroke-linecap="round"/><g fill="white" stroke="#7656ff" stroke-width="3"><circle cx="10" cy="158" r="6"/><circle cx="83" cy="75" r="6"/><circle cx="150" cy="142" r="6"/><circle cx="212" cy="121" r="6"/><circle cx="250" cy="84" r="6"/></g><g fill="#7382a6" font-size="11"><text x="7" y="242">Mon</text><text x="43" y="242">Tue</text><text x="82" y="242">Wed</text><text x="125" y="242">Thu</text><text x="164" y="242">Fri</text><text x="204" y="242">Sat</text><text x="238" y="242">Sun</text></g></svg></div></div></div><div class="card summary"><div class="eyebrow">AI summary</div><h3>Your mood is improving!</h3><p id="aiSummaryText">${state.aiInsight || 'You’re showing more good days this week.'}</p></div></div>`}
function calendar(){
  const nums=[28,29,30,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,1];
  return `<div class="page">${header('Calendar',`<button class="icon-btn"><svg viewBox="0 0 24 24"><path d="M4 4h16l-6 7v6l-4 3v-9z"/></svg></button>`)}<div class="calendar-title"><h2 style="margin:0">May 2025</h2><div class="month-nav"><button>‹</button><button>›</button></div></div><div class="weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<span>${x}</span>`).join('')}</div><div class="days">${nums.map((n,i)=>`<div class="day ${i<3||i===34?'muted':''} ${n===14&&i>3?'selected':''}"><span>${n}</span>${i>6&&i<31?`<span class="mood-dots"><i style="background:${['#62d3b1','#7aa9ff','#fbc658','#ff9b67','#ff78a8'][i%5]}"></i>${i%3===0?'<i style="background:#7656ff"></i>':''}</span>`:''}</div>`).join('')}</div><div class="card record"><div class="record-head"><h3 style="margin:0">May 14, 2025</h3><span>•••</span></div><div class="record-body"><div class="mood-face m3">${face('flat')}</div><div><strong>Okay</strong><span style="float:right;color:var(--muted);font-size:12px">8:30 PM</span><p>A normal day. Got lots of work done and took a walk outside.</p></div></div></div></div>`}
function chat(){return `<div class="page">${header('Chat',`<button class="icon-btn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button>`)}<div class="card chat-hero"><div><h3>Hi, I’m Moodly AI</h3><p>Your personal wellness companion.<br/>I’m here to listen and support you.</p></div>${orb('small')}</div><div class="quick-title">Start a conversation</div><div id="quickList"><div class="quick q1" data-prompt="I'm feeling stressed"><span class="emoji">😟</span>I’m feeling stressed</div><div class="quick q2" data-prompt="I need motivation"><span class="emoji">🚀</span>I need motivation</div><div class="quick q3" data-prompt="Help me sleep better"><span class="emoji">🌙</span>Help me sleep better</div><div class="quick q4" data-prompt="Just want to chat"><span class="emoji">💬</span>Just want to chat</div></div><div id="chatPanel" class="chat-panel"></div><div class="chat-input"><input id="chatInput" placeholder="Message Moodly AI..."/><button class="send" id="sendBtn">➤</button></div></div>`}
function settings(){const row=(ic,n,v='›')=>`<div class="setting-row"><div class="setting-icon">${ic}</div><div class="setting-name">${n}</div><div class="setting-value">${v}</div></div>`;return `<div class="page">${header('Settings','')}<div class="section-label">Preferences</div><div class="card settings-group">${row('◎','Language','English ›')}${row('☾','Theme','Light ›')}${row('♧','Reminders','On ›')}${row('♢','Privacy','›')}${row('◌','Notifications','On ›')}</div><div class="section-label" style="margin-top:22px">Support</div><div class="card settings-group">${row('?','Help Center','›')}${row('◌','Send Feedback','›')}${row('ⓘ','About Moodly','›')}</div><button class="primary logout">Log Out</button></div>`}
function render(){const pages={today,reflection,insights,calendar,chat,settings};app.innerHTML=pages[state.page]();renderNav();bind();postRender();}
function bind(){app.querySelectorAll('[data-go]').forEach(x=>x.onclick=()=>go(x.dataset.go));app.querySelectorAll('[data-mood]').forEach(x=>x.onclick=()=>{state.mood=x.dataset.mood;localStorage.setItem('moodlyMood',state.mood);render();});const note=document.getElementById('note');if(note){note.oninput=()=>{state.note=note.value;document.getElementById('count').textContent=note.value.length;localStorage.setItem('moodlyNote',state.note);};document.getElementById('checkin').onclick=async()=>{localStorage.setItem('moodlyMood',state.mood);localStorage.setItem('moodlyNote',state.note);state.aiReflection='';toast('Check-in saved');go('reflection');generateReflection();};}app.querySelectorAll('[data-prompt]').forEach(x=>x.onclick=()=>openChat(x.dataset.prompt));const send=document.getElementById('sendBtn');if(send)send.onclick=()=>{const input=document.getElementById('chatInput');if(input.value.trim())openChat(input.value.trim());};}
async function openChat(text){state.messages.push({role:'user',text});state.page='chat';render();const panel=document.getElementById('chatPanel');panel.classList.add('open');panel.innerHTML=state.messages.map(m=>`<div class="msg ${m.role}">${m.text}</div>`).join('')+`<div class="msg ai typing">Moodly is thinking…</div>`;try{const answer=await callMoodlyAI({type:'chat',message:text,mood:state.mood,history:state.messages.slice(-10)});state.messages.push({role:'ai',text:answer});}catch{state.messages.push({role:'ai',text:mockReply(text)});}render();document.getElementById('chatPanel').classList.add('open');}

async function callMoodlyAI(payload){
  const response=await fetch('/api/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error||'AI request failed');
  return data.text;
}
async function generateReflection(){
  const el=document.getElementById('reflectionText');
  if(el) el.textContent='Moodly is reflecting…';
  try{
    state.aiReflection=await callMoodlyAI({type:'reflection',mood:state.mood,note:state.note});
  }catch{
    state.aiReflection='';
  }
  if(state.page==='reflection') render();
}
async function generateInsight(){
  if(state.aiInsight) return;
  const records=[
    {day:'Mon',mood:'Okay'},{day:'Tue',mood:'Good'},{day:'Wed',mood:'Great'},
    {day:'Thu',mood:'Okay'},{day:'Fri',mood:'Good'},{day:'Sat',mood:'Good'},{day:'Sun',mood:state.mood}
  ];
  try{
    state.aiInsight=await callMoodlyAI({type:'insight',moodRecords:records});
    if(state.page==='insights') render();
  }catch{}
}
function postRender(){
  if(state.page==='insights') generateInsight();
}

function mockReply(t){const s=t.toLowerCase();if(s.includes('stress'))return 'That sounds heavy. Let’s slow down together: name one thing you can pause, and one small thing you can do next.';if(s.includes('sleep'))return 'A gentle wind-down may help. Try dimming the lights, putting the phone aside, and taking five slow breaths.';if(s.includes('motivation'))return 'You do not need a huge burst of motivation. Choose one action that takes less than five minutes and begin there.';return 'I’m here with you. Tell me a little more about what is on your mind today.';}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.querySelector('.phone').appendChild(t);setTimeout(()=>t.remove(),1200)}
render();

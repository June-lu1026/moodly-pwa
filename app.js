const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
let selectedMood='Okay';
qsa('.tabbar button').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.screen)));
qsa('[data-open]').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.open)));
function show(id){qsa('.screen').forEach(s=>s.classList.toggle('active',s.id===id));qsa('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));qs('#composer').classList.toggle('show',id==='chat');}
qsa('.mood').forEach(btn=>btn.addEventListener('click',()=>{qsa('.mood').forEach(x=>x.classList.remove('active'));btn.classList.add('active');selectedMood=btn.dataset.mood;}));
const note=qs('#noteInput');note.addEventListener('input',()=>qs('#count').textContent=note.value.length);
qs('#checkBtn').addEventListener('click',()=>{
  const map={Great:'mint',Good:'blue',Okay:'yellow',Low:'orange',Awful:'pink'};
  const copy={
    Great:{title:"You've been feeling great today.",body:"Joy deserves to be noticed. Take a moment to appreciate what helped you feel lighter today."},
    Good:{title:"You've been feeling good today.",body:"You seem grounded and positive. Hold on to the small moments that helped you feel this way."},
    Okay:{title:"You've been feeling okay today.",body:"Calm is a meaningful state too. You don't need to push hard every day. Naming what you feel is already a caring step."},
    Low:{title:"You've been feeling low today.",body:"A difficult day does not define you. Be gentle with yourself and focus on one small thing you need right now."},
    Awful:{title:"Today has felt especially hard.",body:"You do not have to solve everything at once. Pause, breathe, and reach out to someone you trust when you can."}
  };
  const art=document.createElement('article');
  art.innerHTML=`<span class="face ${map[selectedMood]} small">${selectedMood==='Okay'?'—':selectedMood==='Low'||selectedMood==='Awful'?'⌢':'☺'}</span><div><b>${selectedMood}</b><small>Just now</small><p>${note.value||'A moment of self-awareness.'}</p></div>`;
  qs('#records').prepend(art);
  const reflection=copy[selectedMood];
  qs('.reflection-card h3').textContent=reflection.title;
  qs('.reflection-card p').textContent=reflection.body;
  const b=qs('#checkBtn');
  b.innerHTML='Checked In <i>✓</i>';
  note.value='';
  qs('#count').textContent='0';
  setTimeout(()=>{
    b.innerHTML='Check In <i>✦</i>';
    show('reflection');
  },450);
});
const cal=qs('#calendarGrid');['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach(x=>cal.insertAdjacentHTML('beforeend',`<b>${x}</b>`));for(let i=1;i<=31;i++){const c=i===17?'selected':([2,3,5,6,9,11,13,16,20,24].includes(i)?'dot':'');cal.insertAdjacentHTML('beforeend',`<i class="${c}">${i}</i>`)}
qs('#sendBtn').addEventListener('click',send);qs('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')send()});function send(){const input=qs('#chatInput');if(!input.value.trim())return;qs('#messages').insertAdjacentHTML('beforeend',`<div class="msg user"><p>${input.value.replace(/[<>]/g,'')}</p></div>`);input.value='';setTimeout(()=>qs('#messages').insertAdjacentHTML('beforeend',`<div class="msg bot"><img src="./icons/icon-192.png"><p>Thank you for sharing that. Let's take one gentle step at a time.</p></div>`),500)}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js');

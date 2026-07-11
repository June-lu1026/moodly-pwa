const moods=[...document.querySelectorAll('.mood-card')];
let selectedMood='Okay';
const input=document.getElementById('noteInput');
const count=document.getElementById('count');
const toast=document.getElementById('toast');
const todayScreen=document.getElementById('todayScreen');
const reflectionScreen=document.getElementById('reflectionScreen');
const tabButtons=[...document.querySelectorAll('.tabbar button')];

moods.forEach(btn=>btn.addEventListener('click',()=>{
  moods.forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});
  btn.classList.add('selected');btn.setAttribute('aria-pressed','true');selectedMood=btn.dataset.mood;
}));
input.addEventListener('input',()=>count.textContent=input.value.length);

function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1100)}
function setActiveTab(name){tabButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.screen===name))}
function showScreen(name){
  todayScreen.classList.toggle('active',name==='today');
  reflectionScreen.classList.toggle('active',name==='reflection');
  setActiveTab(name==='reflection'?'today':name);
}
function updateReflection(){
  const copy={
    Great:['Hold onto this lightness.','Your energy feels open and positive today. Notice what supported this feeling so you can return to it later.','Your mood is bright today. Capture one detail that made the day feel good.'],
    Good:['A steady day is worth celebrating.','You seem grounded today. Small moments of ease are often signs that your routines are supporting you.','Your mood feels balanced. Protect it with one calm, familiar activity.'],
    Okay:["You’re doing better than you think.",'Not every day needs to feel perfect. Showing up, noticing how you feel, and giving yourself space already counts as progress.','Your mood is steady today. A calm evening routine could help you protect that balance.'],
    Low:['Be gentle with yourself today.','A low day does not define your direction. You do not need to solve everything right now—one kind action is enough.','Your energy feels lower today. Reducing pressure may help more than pushing harder.'],
    Awful:['You do not have to carry this alone.','Today may feel heavy. Naming it honestly is already a brave step. Focus only on what helps you feel safe and supported.','Your check-in shows a difficult moment. Consider reaching out to someone you trust.']
  }[selectedMood];
  document.getElementById('reflectionTitle').textContent=copy[0];
  document.getElementById('reflectionText').textContent=copy[1];
  document.getElementById('noticedText').textContent=copy[2];
}

document.getElementById('checkinButton').addEventListener('click',()=>{
  localStorage.setItem('moodly-last-checkin',JSON.stringify({mood:selectedMood,note:input.value,time:new Date().toISOString()}));
  updateReflection();showToast(`${selectedMood} check-in saved`);setTimeout(()=>showScreen('reflection'),380);
});
document.getElementById('reflectionCard').addEventListener('click',()=>{updateReflection();showScreen('reflection')});
document.getElementById('reflectionBack').addEventListener('click',()=>showScreen('today'));
document.getElementById('calendarButton').addEventListener('click',()=>showToast('Calendar is the next milestone'));
tabButtons.forEach(btn=>btn.addEventListener('click',()=>{
  const name=btn.dataset.screen;
  if(name==='today') showScreen('today'); else showToast(`${name[0].toUpperCase()+name.slice(1)} is the next milestone`);
}));
document.querySelectorAll('.suggestion-card').forEach(btn=>btn.addEventListener('click',()=>showToast('Suggestion saved')));

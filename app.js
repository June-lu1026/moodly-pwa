const moods=[...document.querySelectorAll('.mood-card')];
let selectedMood='Okay';
moods.forEach(btn=>btn.addEventListener('click',()=>{moods.forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});btn.classList.add('selected');btn.setAttribute('aria-pressed','true');selectedMood=btn.dataset.mood;}));
const input=document.getElementById('noteInput');const count=document.getElementById('count');input.addEventListener('input',()=>count.textContent=input.value.length);
const toast=document.getElementById('toast');document.getElementById('checkinButton').addEventListener('click',()=>{localStorage.setItem('moodly-last-checkin',JSON.stringify({mood:selectedMood,note:input.value,time:new Date().toISOString()}));toast.textContent=`${selectedMood} check-in saved`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1200);});
function notify(name){toast.textContent=`${name} page will be added next`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1200)}
document.getElementById('calendarButton').addEventListener('click',()=>notify('Calendar'));
document.getElementById('reflectionCard').addEventListener('click',()=>notify('AI Reflection'));
document.querySelectorAll('.tabbar button:not(.active)').forEach(btn=>btn.addEventListener('click',()=>notify(btn.dataset.screen[0].toUpperCase()+btn.dataset.screen.slice(1))));

async function runAI(){
const text=document.getElementById("input").value;
const output=document.getElementById("output");

output.innerHTML="Thinking...";

const API_KEY="YOUR_GEMINI_API_KEY";

try{
const res=await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
contents:[{
parts:[{
text:`You are Moodly AI. Analyze emotion and return JSON:
User: ${text}
Return: emotion, intensity, response, suggestion`
}]
}]
})
}
);

const data=await res.json();
const result=data?.candidates?.[0]?.content?.parts?.[0]?.text;
output.innerHTML="<pre>"+result+"</pre>";

}catch(e){
output.innerHTML="Error: "+e.message;
}
}

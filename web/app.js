let beds = JSON.parse(localStorage.getItem("beds")||"[]");
let currentBedIndex=null;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCLpAN79CDXf7mwDtlubyvg0ezsWnae99s",
  authDomain: "ward-reminder.firebaseapp.com",
  projectId: "ward-reminder",
  storageBucket: "ward-reminder.firebasestorage.app",
  messagingSenderId: "19609491838",
  appId: "1:19609491838:web:15362b256a004ad41a3b2f"
};
firebase.initializeApp(firebaseConfig);
const messaging=firebase.messaging();

// ขอ permission notification
Notification.requestPermission().then(p=>{
  if(p==='granted'){
    messaging.getToken({vapidKey:'YOUR_PUBLIC_VAPID_KEY'}).then(token=>{
      console.log("FCM Token:", token);
      localStorage.setItem("fcmToken", token);
      fetch("https://your-server.com/register-token", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token})
      });
    });
  }
});

// รับ foreground message
messaging.onMessage(payload=>{
  new Notification(payload.notification.title,{
    body:payload.notification.body,
    icon:'icon-192.png'
  });
});

// --- ฟังก์ชันจัดการ beds ---
function renderBeds(){
  const div=document.getElementById("bedList");
  div.innerHTML="";
  beds.forEach((bed,i)=>{
    let done = bed.tasks.filter(t=>t.done).length;
    let total = bed.tasks.length;
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`<b>${bed.name}</b> (${bed.patient})<br>ทำแล้ว ${done}/${total} <br>`;
    const btn=document.createElement("button");
    btn.textContent="ดูรายละเอียด";
    btn.onclick=()=>viewBed(i);
    card.appendChild(btn);
    div.appendChild(card);
  });
}
function showHomePage(){
  document.getElementById("homePage").classList.remove("hidden");
  document.getElementById("addBedPage").classList.add("hidden");
  document.getElementById("bedDetailPage").classList.add("hidden");
  renderBeds();
}
function showAddBedPage(){
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("addBedPage").classList.remove("hidden");
  document.getElementById("bedDetailPage").classList.add("hidden");
  document.getElementById("tasks").innerHTML="";
  addTaskInput();
}
function addTaskInput(){
  const div=document.createElement("div");
  div.innerHTML=`<label>ชื่อยา: <input class="taskName" type="text"></label>
                 <label>เวลาให้ยา: <input class="taskTime" type="time"></label>
                 <label>หมายเหตุ: <input class="taskNote" type="text"></label>`;
  document.getElementById("tasks").appendChild(div);
}
function saveBed(){
  const name=document.getElementById("bedName").value;
  const patient=document.getElementById("patientName").value;
  const tasks=[...document.querySelectorAll("#tasks div")].map(div=>({
    name:div.querySelector(".taskName").value,
    time:div.querySelector(".taskTime").value,
    note:div.querySelector(".taskNote").value,
    done:false
  }));
  const token=localStorage.getItem("fcmToken")||null;
  beds.push({name, patient, tasks, fcmToken:token});
  localStorage.setItem("beds", JSON.stringify(beds));
  fetch("https://your-server.com/save-beds",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(beds)
  });
  showHomePage();
}
function viewBed(i){
  currentBedIndex=i;
  const bed=beds[i];
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("addBedPage").classList.add("hidden");
  document.getElementById("bedDetailPage").classList.remove("hidden");
  document.getElementById("bedDetailTitle").textContent=`${bed.name} (${bed.patient})`;
  renderTasks(bed);
}
function renderTasks(bed){
  const div=document.getElementById("taskList");
  div.innerHTML="";
  bed.tasks.forEach((task,idx)=>{
    const tdiv=document.createElement("div");
    tdiv.className=task.done?"task-done task-pending":"task-pending";
    tdiv.innerHTML=`<label><input type="checkbox" ${task.done?"checked":""} onchange="toggleTask(${idx})"> ${task.time} ${task.name} - ${task.note}</label>`;
    div.appendChild(tdiv);
  });
}
function toggleTask(idx){
  beds[currentBedIndex].tasks[idx].done=!beds[currentBedIndex].tasks[idx].done;
  localStorage.setItem("beds",JSON.stringify(beds));
  renderTasks(beds[currentBedIndex]);
  renderBeds();
}

showHomePage();

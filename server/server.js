import express from "express";
import admin from "firebase-admin";
import fs from "fs";
import cors from "cors";
import cron from "node-cron";

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const messaging = admin.messaging();
const DATA_FILE="./beds.json";

// โหลด beds
function loadBeds(){
  let beds=[];
  if(fs.existsSync(DATA_FILE)){
    try{
      const data = fs.readFileSync(DATA_FILE,"utf8");
      beds = JSON.parse(data||"[]");
    }catch(e){beds=[];}
  }
  return beds;
}
function saveBeds(beds){
  fs.writeFileSync(DATA_FILE,JSON.stringify(beds,null,2));
}

// register FCM token
app.post("/register-token",(req,res)=>{
  const token=req.body.token;
  let beds=loadBeds();
  beds=beds.map(b=>({...b,fcmToken:b.fcmToken||token}));
  saveBeds(beds);
  res.json({ok:true});
});

// save beds
app.post("/save-beds",(req,res)=>{
  saveBeds(req.body);
  res.json({ok:true});
});

// ส่ง notification
function sendNotification(token,title,body){
  messaging.send({notification:{title,body},token})
    .then(r=>console.log("Sent:",title))
    .catch(e=>console.log("Error:",e));
}

// cron job ตรวจเวลา ทุกนาที
cron.schedule("* * * * *",()=>{
  const beds = loadBeds();
  const now=new Date();
  beds.forEach(bed=>{
    if(!bed.fcmToken) return;
    bed.tasks.forEach(task=>{
      if(task.done||!task.time) return;
      const [h,m]=task.time.split(":").map(Number);
      const taskTime=new Date();
      taskTime.setHours(h,m,0,0);
      const diff=(taskTime-now)/60000;
      if(diff>=0 && diff<=1){
        sendNotification(bed.fcmToken,`ให้ยา ${task.name}`,`เตียง ${bed.name} - ${bed.patient} ใกล้เวลายา ${task.time}`);
      }
    });
  });
});

app.listen(3000,()=>console.log("Server running on port 3000"));

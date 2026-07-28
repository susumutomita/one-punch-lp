import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";

const seed=process.env.FLAG_SEED||"local";
const state={environment:true,inquiry:false,analysis:false,issue:false,approval:false,record:null};
const proofs=Object.fromEntries(Object.keys(state).filter((k)=>k!=="record").map((k)=>[k,createHash("sha256").update(`${seed}:${k}`).digest("hex").slice(0,24)]));

const app=createServer(async(req,res)=>{
  try{
    if(req.method==="GET"&&(req.url==="/"||req.url==="/tutorial"))return html(res,page());
    if(req.method==="POST"&&req.url==="/api/inquiry"){
      const body=await jsonBody(req);state.inquiry=true;state.analysis=true;state.record={id:randomUUID(),payload:body,analysis:{category:/協業/.test(body.message||"")?"partnership":"sales",synergyScore:8,summary:String(body.message||"").slice(0,120),replyDraft:`${body.name||"ご担当者"}様\n\nお問い合わせありがとうございます。`}};return json(res,{ok:true,record:state.record,proof:proofs.inquiry});
    }
    if(req.method==="POST"&&req.url==="/api/issue"){if(!state.analysis)throw new Error("analysis required");state.issue=true;return json(res,{ok:true,issueUrl:"https://github.com/example/demo/issues/1",proof:proofs.issue});}
    if(req.method==="POST"&&req.url==="/api/approve"){if(!state.analysis)throw new Error("analysis required");state.approval=true;return json(res,{ok:true,status:"approved",proof:proofs.approval});}
    return text(res,404,"Not found");
  }catch(error){return json(res,{ok:false,message:error.message},400);}
});
app.listen(18080,"0.0.0.0");

createServer(async(req,res)=>{
  try{if(req.method!=="POST"||req.url!=="/verify")return text(res,404,"Not found");const body=await jsonBody(req);const id=body.checkpointId;const correct=Boolean(state[id])&&(body.submission===proofs[id]||body.submission==="verify");return json(res,{correct,checkpointId:id,message:correct?"Checkpoint cleared":"Complete the tutorial action and submit its proof"});}catch(error){return json(res,{correct:false,message:error.message},400);}
}).listen(18081,"0.0.0.0");

function page(){return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>One Punch LP Tutorial</title><style>body{font:16px system-ui;max-width:820px;margin:50px auto;padding:20px;background:#f5f2ea;color:#111827}section{background:white;border:1px solid #ccc;padding:24px;margin:18px 0}input,textarea,button{font:inherit;padding:10px;width:100%;margin:6px 0;box-sizing:border-box}button{background:#111827;color:white;border:0}pre{white-space:pre-wrap;background:#111827;color:#fff;padding:16px}</style><h1>問い合わせを仕事に変える</h1><p>架空の問い合わせで、受付から人間承認までを通します。</p><section><input id="name" value="山田テスト"><textarea id="message">生成AIを使ったプロトタイプ検証について協業を相談したいです。</textarea><button onclick="sendInquiry()">1. 問い合わせを送る</button></section><section><button onclick="createIssue()">2. GitHub Issue化</button><button onclick="approve()">3. 返信案を承認</button></section><pre id="out">環境 proof: ${proofs.environment}</pre><script>const out=document.querySelector('#out');async function call(path,body={}){const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const d=await r.json();out.textContent=JSON.stringify(d,null,2);return d}async function sendInquiry(){const d=await call('/api/inquiry',{name:name.value,email:'test@example.com',message:message.value});out.textContent+='\nanalysis proof: ${proofs.analysis}'}async function createIssue(){await call('/api/issue')}async function approve(){await call('/api/approve')}</script></html>`;}
function jsonBody(req){return new Promise((resolve,reject)=>{let s="";req.on("data",c=>{s+=c;if(s.length>65536)reject(new Error("too large"));});req.on("end",()=>{try{resolve(JSON.parse(s||"{}"));}catch{reject(new Error("invalid json"));}});req.on("error",reject);});}
function json(res,value,status=200){res.writeHead(status,{"content-type":"application/json; charset=utf-8"});res.end(JSON.stringify(value));}
function html(res,value){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(value);}
function text(res,status,value){res.writeHead(status,{"content-type":"text/plain; charset=utf-8"});res.end(value);}

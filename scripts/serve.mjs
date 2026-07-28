import { createServer } from "node:http";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { analyzeInquiry, loadConfig, normalizeInquiry } from "../src/core.mjs";

const root = resolve(import.meta.dirname, "..");
const config = await loadConfig(new URL("../one-punch-lp.config.json", import.meta.url));
const port = Number(process.env.PORT || 8788);
const dist = resolve(root, "dist");
const local = resolve(root, ".local");
await mkdir(local, { recursive: true });

createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/inquiries") return await inquiry(req, res);
    const path = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    if (path.includes("..")) return send(res, 400, "Bad request");
    const body = await readFile(resolve(dist, `.${path}`));
    res.writeHead(200, { "content-type": mime(path), "cache-control": "no-store" }); res.end(body);
  } catch (error) { send(res, 404, error.message); }
}).listen(port, "127.0.0.1", () => console.log(`One Punch LP: http://127.0.0.1:${port}`));

async function inquiry(req, res) {
  const raw = await readJson(req, 64 * 1024);
  if (raw.website) return json(res, 200, { ok: true });
  if (Date.now() - Number(raw.formStartedAt || 0) < 800) return json(res, 429, { ok: false, message: "送信が速すぎます" });
  const payload = normalizeInquiry(raw, config);
  const analysis = analyzeInquiry(payload, config);
  const record = { inquiryId: crypto.randomUUID(), receivedAt: new Date().toISOString(), payload, analysis, integrations: { slack: "simulated", github: analysis.synergyScore >= config.automation.githubIssueMinimumScore ? "simulated" : "skipped", reply: "draft-simulated" } };
  await appendFile(resolve(local, "inquiries.jsonl"), `${JSON.stringify(record)}\n`, "utf8");
  console.log(JSON.stringify(record, null, 2));
  json(res, 200, { ok: true, inquiryId: record.inquiryId });
}
function readJson(req, limit) { return new Promise((resolvePromise, reject) => { let text=""; req.on("data",(chunk)=>{text+=chunk;if(Buffer.byteLength(text)>limit){reject(new Error("Payload too large"));req.destroy();}}); req.on("end",()=>{try{resolvePromise(JSON.parse(text||"{}"));}catch{reject(new Error("Invalid JSON"));}}); req.on("error",reject); }); }
function json(res, status, value) { res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(value)); }
function send(res,status,text){res.writeHead(status,{"content-type":"text/plain; charset=utf-8"});res.end(text);}
function mime(path){return extname(path)===".html"?"text/html; charset=utf-8":extname(path)===".js"?"text/javascript; charset=utf-8":"application/octet-stream";}

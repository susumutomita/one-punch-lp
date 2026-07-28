import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const root=resolve(import.meta.dirname,"..");
for(const file of ["scripts/generate.mjs","scripts/serve.mjs","apps-script/Code.js","tenkacloud/problem/server.mjs"]){const r=spawnSync(process.execPath,["--check",file],{cwd:root,stdio:"inherit"});if(r.status)process.exit(r.status);}
const forbidden=[/hooks\.slack\.com\/services\/[A-Z0-9/]{20,}/i,/gh[pousr]_[A-Za-z0-9_]{20,}/,/sk-[A-Za-z0-9_-]{20,}/,/AIza[0-9A-Za-z_-]{30,}/];
let count=0;for(const file of await walk(root)){const text=await readFile(file,"utf8").catch(()=>"");count++;for(const pattern of forbidden)if(pattern.test(text))throw new Error(`Possible secret: ${file}`);}console.log(`Check passed (${count} files)`);
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){if([".git","node_modules",".local","dist"].includes(e.name))continue;const p=join(dir,e.name);out.push(...(e.isDirectory()?await walk(p):[p]));}return out;}

import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { loadConfig } from "../src/core.mjs";

const root = resolve(import.meta.dirname, "..");
const localDir = join(root, ".local");
const claspProject = join(root, ".clasp.json");
const config = await loadConfig(join(root, "one-punch-lp.config.json"));
await mkdir(localDir, { recursive: true });

run(process.execPath, ["scripts/generate.mjs"]);
ensureClaspAuthentication();

if (!(await exists(claspProject))) {
  runNpx(["create-script", "--type", "webapp", "--title", `${config.project.name} - One Punch LP`, "--rootDir", "apps-script"]);
}

runNpx(["push", "--force"]);
const previous = await readJsonOrNull(join(localDir, "google-deployment.json"));
const args = ["create-deployment", "--description", `One Punch LP ${new Date().toISOString()}`];
if (previous?.deploymentId) args.push("--deploymentId", previous.deploymentId);
const output = runNpx(args, true);
const deploymentId = previous?.deploymentId || extractDeploymentId(output);
if (!deploymentId) throw new Error("Apps Script deployment IDを取得できませんでした。clasp list-deploymentsで確認してください。");

const webAppUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;
await writeFile(join(localDir, "google-deployment.json"), `${JSON.stringify({ deploymentId, webAppUrl, updatedAt: new Date().toISOString() }, null, 2)}\n`);
const htmlPath = join(root, "dist", "index.html");
const html = (await readFile(htmlPath, "utf8")).replaceAll("__ONE_PUNCH_ENDPOINT__", webAppUrl);
await writeFile(htmlPath, html, "utf8");
console.log(`\nWeb App: ${webAppUrl}`);
console.log("LPのdist/index.htmlへ受付URLを反映しました。");
console.log("次にApps ScriptのScript Propertiesをdocs/setup.mdに従って設定してください。");

function ensureClaspAuthentication() {
  if (process.env.CLASP_CONFIG_AUTH || process.env.clasp_config_auth || existsSync(join(homedir(), ".clasprc.json"))) return;
  runNpx(["login"]);
}
function runNpx(args, capture = false) { return run("npx", ["--yes", "@google/clasp@latest", ...args], capture); }
function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit" });
  const output = capture ? `${result.stdout || ""}${result.stderr || ""}` : "";
  if (capture && output) process.stdout.write(output);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}`);
  return output;
}
function extractDeploymentId(text) {
  const candidates = text.match(/[A-Za-z0-9_-]{40,}/g) || [];
  return candidates.find((value) => value.startsWith("AKfy")) || candidates.at(-1) || "";
}
async function exists(pathname) { try { await access(pathname); return true; } catch { return false; } }
async function readJsonOrNull(pathname) { try { return JSON.parse(await readFile(pathname, "utf8")); } catch { return null; } }

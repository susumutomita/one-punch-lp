import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const token = process.env.ONE_PUNCH_SETUP_TOKEN;
if (!token || token.length < 24) {
  throw new Error("ONE_PUNCH_SETUP_TOKEN must be at least 24 characters");
}
const root = resolve(import.meta.dirname, "..");
const pathname = resolve(root, "apps-script/Code.js");
const source = await readFile(pathname, "utf8");
const placeholder = "__SETUP_TOKEN_SHA256__";
if (!source.includes(placeholder)) throw new Error("Setup token placeholder was not found");
const hash = createHash("sha256").update(token).digest("hex");
await writeFile(pathname, source.replace(placeholder, hash), "utf8");
console.log("Injected setup token hash into Apps Script");

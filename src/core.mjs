import { readFile } from "node:fs/promises";

export async function loadConfig(pathname = new URL("../one-punch-lp.config.json", import.meta.url)) {
  const config = JSON.parse(await readFile(pathname, "utf8"));
  validateConfig(config);
  return config;
}

export function validateConfig(config) {
  if (!config || typeof config !== "object") throw new Error("config must be an object");
  for (const key of ["project", "site", "form", "automation", "ai"]) {
    if (!config[key] || typeof config[key] !== "object") throw new Error(`${key} is required`);
  }
  for (const key of ["name", "description", "contactEmail"]) required(config.project[key], `project.${key}`);
  for (const key of ["headline", "subheadline"]) required(config.site[key], `site.${key}`);
  if (!Array.isArray(config.site.features) || config.site.features.length === 0) throw new Error("site.features is required");
  if (!Array.isArray(config.form.fields) || config.form.fields.length < 2) throw new Error("form.fields requires at least two fields");
  const ids = new Set();
  for (const field of config.form.fields) {
    required(field.id, "field.id");
    required(field.label, `${field.id}.label`);
    required(field.type, `${field.id}.type`);
    if (ids.has(field.id)) throw new Error(`duplicate field id: ${field.id}`);
    ids.add(field.id);
    if (field.type === "select" && (!Array.isArray(field.options) || field.options.length === 0)) throw new Error(`${field.id}.options is required`);
  }
  if (!ids.has("email") || !ids.has("message")) throw new Error("email and message fields are required");
  if (!Number.isInteger(config.automation.githubIssueMinimumScore) || config.automation.githubIssueMinimumScore < 0 || config.automation.githubIssueMinimumScore > 10) throw new Error("githubIssueMinimumScore must be 0-10");
  if (!["draft-only", "approval-required", "auto"].includes(config.automation.replyMode)) throw new Error("invalid replyMode");
  return config;
}

export function normalizeInquiry(raw, config) {
  const output = {};
  for (const field of config.form.fields) {
    const value = String(raw[field.id] ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
    const max = field.maxLength ?? 1000;
    if (field.required && !value) throw new Error(`${field.label}を入力してください`);
    if (value.length > max) throw new Error(`${field.label}が長すぎます`);
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error("メールアドレスの形式が正しくありません");
    output[field.id] = value;
  }
  return output;
}

export function analyzeInquiry(payload, config) {
  const text = Object.values(payload).join(" ").toLowerCase();
  let score = 4;
  for (const signal of config.ai.positiveSignals) if (text.includes(signal.toLowerCase())) score += 1;
  for (const signal of config.ai.negativeSignals) if (text.includes(signal.toLowerCase())) score -= 2;
  if (payload.company) score += 1;
  if ((payload.message ?? "").length >= 120) score += 1;
  score = Math.max(0, Math.min(10, score));
  const category = classify(text);
  const riskFlags = [];
  if (/契約|法務|訴訟|返金|苦情|billing|contract/.test(text)) riskFlags.push("legal-or-complaint");
  if (/脆弱性|漏えい|セキュリティ|不正アクセス|security/.test(text)) riskFlags.push("security");
  if (/パスワード|秘密鍵|api.?key|token|secret/.test(text)) riskFlags.push("possible-secret");
  const summary = String(payload.message || "").replace(/\s+/g, " ").slice(0, 180);
  return {
    category,
    priority: score >= 8 ? "high" : score >= 5 ? "normal" : "low",
    synergyScore: score,
    confidence: 0.58,
    summary,
    recommendedAction: score >= 7 ? "内容を確認し、面談または具体的な次のアクションを提案する。" : "一次確認後に定型返信または見送りを判断する。",
    riskFlags,
    replySubject: `お問い合わせありがとうございます - ${config.project.name}`,
    replyDraft: `${payload.name || "ご担当者"}様\n\nお問い合わせありがとうございます。内容を確認し、担当者より改めてご連絡します。\n\n${config.project.name}`
  };
}

export function canAutoReply(analysis, config) {
  return config.automation.replyMode === "auto" &&
    config.automation.autoReplyCategories.includes(analysis.category) &&
    analysis.confidence >= config.automation.minimumAutoReplyConfidence &&
    analysis.riskFlags.length === 0;
}

export function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function classify(text) {
  const rules = [
    ["bug", /不具合|バグ|error|障害|動かない/],
    ["partnership", /協業|提携|共同|パートナー/],
    ["sales", /導入|見積|相談|発注|依頼/],
    ["recruitment", /採用|求人|応募|候補者/],
    ["document-request", /資料|ホワイトペーパー|ダウンロード/],
    ["event", /イベント|勉強会|登壇|参加/]
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] ?? "other";
}

function required(value, path) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} is required`);
}

import test from "node:test";
import assert from "node:assert/strict";
import { analyzeInquiry, canAutoReply, loadConfig, normalizeInquiry, validateConfig } from "../src/core.mjs";

const config = await loadConfig(new URL("../one-punch-lp.config.json", import.meta.url));

test("config is valid", () => assert.equal(validateConfig(config), config));
test("normalizes inquiry", () => assert.equal(normalizeInquiry({ name:" Test ", email:"a@example.com", company:"", topic:"協業", message:"相談" }, config).name, "Test"));
test("rejects invalid email", () => assert.throws(() => normalizeInquiry({ name:"Test", email:"bad", topic:"協業", message:"相談" }, config), /メール/));
test("scores relevant inquiry", () => { const result=analyzeInquiry({name:"A",email:"a@example.com",company:"Example",topic:"協業",message:"生成AIのプロトタイプ検証とユーザー導入について協業したい"},config);assert.equal(result.category,"partnership");assert.ok(result.synergyScore>=7); });
test("blocks risky auto replies", () => { const changed=structuredClone(config);changed.automation.replyMode="auto";changed.automation.autoReplyCategories=["sales"];changed.automation.minimumAutoReplyConfidence=.5;assert.equal(canAutoReply({category:"sales",confidence:.9,riskFlags:["security"]},changed),false); });

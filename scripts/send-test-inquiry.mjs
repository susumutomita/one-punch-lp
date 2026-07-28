const endpoint = process.env.ONE_PUNCH_ENDPOINT || "http://127.0.0.1:8788/api/inquiries";
const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "山田テスト", email: "test@example.com", company: "Example Labs", topic: "協業", message: "生成AIを使った新規事業のプロトタイプ検証について協業を相談したいです。現場ユーザーへのアクセスがあります。", website: "", formStartedAt: Date.now() - 5000 }) });
console.log(await response.text());
if (!response.ok) process.exit(1);

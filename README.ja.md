# ワンパンLP

サービス概要を渡すだけで、**LP、問い合わせ受付、Google Sheets保存、AI一次分析、Slack通知、条件付きGitHub Issue化、返信案作成**まで生成するAI Skillとテンプレートです。

> 問い合わせが来るページではなく、問い合わせを仕事に変えるページを一撃で作る。

デモは架空サービス `PilotForge` です。特定企業・顧客案件・既存サイトの情報は含みません。

## ローカル実行

Node.js 22以上を使用します。外部npm依存はありません。

```bash
npm run dev
```

<http://127.0.0.1:8788> を開き、別ターミナルでテスト問い合わせを送れます。

```bash
npm run inquiry:test
npm test
npm run check
```

問い合わせは `.local/inquiries.jsonl` に保存され、Slack・GitHub・メール処理はローカルでは安全にシミュレーションされます。

## カスタマイズ

`one-punch-lp.config.json` を編集してから生成します。

```bash
npm run generate
```

生成先は `dist/` です。公開時は静的ホスティングへ配置し、`apps-script/Code.js` をGoogle Apps Script Web Appとしてデプロイします。

Apps Script Propertiesには次を設定できます。

- `SPREADSHEET_ID`
- `SLACK_WEBHOOK_URL`
- `GITHUB_TOKEN`
- `GITHUB_REPOSITORY` (`owner/repo`)
- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`
- `NOTIFICATION_EMAIL`
- `REPLY_MODE` (`draft-only` / `approval-required` / `auto`)

初期値は必ず `draft-only` です。法務、苦情、セキュリティ、秘密情報を含む問い合わせは自動返信しません。

## Skill

`skills/one-punch-lp/SKILL.md` をコーディングエージェントへ読み込ませ、事業内容、フォーム項目、通知先、シナジー基準を自然言語で依頼します。

## TenkaCloud

```bash
npm run tenkacloud:dev
```

- チュートリアル: <http://127.0.0.1:18080/tutorial>
- 採点API: <http://127.0.0.1:18081/verify>

問い合わせ送信、一次分析、Issue化、返信承認を独立チェックポイントとして体験できます。

## 無料の意味

月額SaaS契約を必須にせず、Google、GitHub、Slackの無料枠で開始できます。AI推論、独自ドメイン、各サービスの無料枠超過は無料保証の対象外です。

Apache License 2.0

# Setup guide

## 1. Generate and verify

```bash
npm run generate
npm test
npm run check
```

## 2. Deploy Google Apps Script

```bash
npm run google:deploy
```

The first run opens Google's authorization flow. The command creates or updates the Apps Script Web App and injects its URL into `dist/index.html`.

## 3. Configure Script Properties

In Apps Script, open **Project Settings → Script Properties** and set only the integrations you use:

- `SPREADSHEET_ID` — required inquiry destination
- `NOTIFICATION_EMAIL` — optional administrator notification
- `SLACK_WEBHOOK_URL` — optional Slack Incoming Webhook
- `GITHUB_REPOSITORY` — optional `owner/repository`
- `GITHUB_TOKEN` — optional fine-grained token with Issues write permission
- `AI_BASE_URL` — optional OpenAI-compatible endpoint
- `AI_MODEL` — optional model name
- `AI_API_KEY` — optional BYOK key
- `REPLY_MODE` — `draft-only` (recommended), `approval-required`, or `auto`

Keep `draft-only` until fictional test inquiries have been verified end to end.

## 4. Verify

Submit a fictional inquiry and confirm the row, fallback or AI analysis, optional Slack notification, conditional GitHub Issue, and Gmail draft.

## 5. Optional GitHub Actions deployment

Define `CLASPRC_JSON`, `CLASP_JSON`, and `APPS_SCRIPT_DEPLOYMENT_ID`. Apps Script deployment remains manual through `workflow_dispatch`.

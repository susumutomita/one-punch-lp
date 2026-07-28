# One Punch LP

An AI skill and source-owned template for generating a landing page plus the workflow behind it: inquiry intake, Google Sheets storage, AI triage, Slack notification, conditional GitHub Issues, and safe reply drafts.

The included demo, **PilotForge**, is fictional and contains no customer or private-project information.

```bash
npm run dev
# http://127.0.0.1:8788

npm run inquiry:test
npm test
npm run check
```

Edit `one-punch-lp.config.json`, then run `npm run generate`. Deploy `apps-script/Code.js` as a Google Apps Script Web App and set the endpoint in the generated page.

See [README.ja.md](./README.ja.md) for details.

## Safety defaults

- Draft-only replies
- Human review for important inquiries
- No auto-reply for legal, complaint, security, privacy, billing, contract, or possible-secret content
- BYOK AI; deterministic fallback when AI is not configured

Apache License 2.0

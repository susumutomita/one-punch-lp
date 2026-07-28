# Architecture

```text
Static LP
  -> Google Apps Script Web App
       -> Google Sheets
       -> optional OpenAI-compatible API (BYOK)
       -> Slack webhook
       -> conditional GitHub Issue
       -> Gmail draft or tightly constrained auto-reply
```

The browser, inquiry body, and AI output are untrusted. The deterministic analyzer remains available when AI is not configured. Reply mode defaults to `draft-only`; automatic sending requires an allowlisted category, high confidence, and no risk flags.

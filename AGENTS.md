# SCTN frontend instructions

Read these before editing:

- [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md)
- [.agent/MEMORY.md](.agent/MEMORY.md)
- [.agent/CHANGELOG.md](.agent/CHANGELOG.md)
- [Integration runbook](https://github.com/Nafis3000XD/sctn-web/blob/main/.agent/RUNBOOK.md)

- [.agent/DEPLOYMENT.md](.agent/DEPLOYMENT.md)

## Handoff after each conversation

- When a conversation changes this project or confirms a new project decision, update the relevant `.agent/MEMORY.md` before handing off. Update the project-level memory in the integration repository for cross-component or deployment changes.
- For each change, append a dated entry to the relevant `.agent/CHANGELOG.md` and to the project log. Record the change, affected files or routes, verification actually run, deployment status, and any follow-up. If nothing durable changed, skip an entry.
- Keep memory concise and factual. Summarize outcomes and decisions without raw conversation transcripts, personal data, login credentials, tokens, database URLs, deploy hooks, or private keys. Mark unverified claims and pending work clearly.

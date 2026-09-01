# Development & Execution Rules

## 1. Zero Hallucination Principle
- All documentation and diagrams MUST be grounded strictly in empirical evidence from code, verified database schemas, and actual project assets.
- Never invent architectural components, endpoints, or database tables that do not exist.

## 2. Verification Before Completion
- Never mark a documentation or sync task complete without executing verification commands.
- Verify Markdown formatting, check header metadata (`Version`, `Last Updated`, `Lark Doc ID`), and ensure `drawio-cli` exports complete without errors.

## 3. Atomic Commit & Sync Operations
- When making documentation updates, update local Markdown files in `./docs/` first.
- Re-compile diagrams (`.drawio` -> `.drawio.svg` & PNG Retina 2x) before syncing to Lark Docs.
- Always use `docs +update` for existing documents to prevent duplicate creation on Lark.

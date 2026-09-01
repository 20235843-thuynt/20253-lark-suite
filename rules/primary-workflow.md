# Primary Execution Workflow for AI Agents

This document defines the mandatory, unambiguous step-by-step algorithm for AI Agents operating in this repository.

---

## 🧭 PHASE 1: Task Classification & File Mapping

When a user requests technical documentation, architecture design, or sync tasks:

1. **Read Workspace Context**: Inspect `./AGENTS.md`, `./README.md`, and `docs/doc-mapping.json`.
2. **Determine Target Document(s)**: Map user intent to the appropriate standard document in `./docs/`:
   - **`01-prd.md`**: Business goals, user personas, use cases, acceptance criteria.
   - **`02-system-architecture.md`**: System context, architecture containers, sequence flows, data flows.
   - **`03-database-design.md`**: ERD, relational database schemas, tables, indexes, data types.
   - **`04-codebase-api-reference.md`**: Directory structure, REST API endpoints, request/response JSON schemas.
   - **`05-development-standards.md`**: TypeScript/React coding standards, naming conventions, Git branch strategy.
   - **`06-ui-ux-design-system.md`**: Design tokens, color palette, typography, visual components, layout guides.
   - **`07-testing-deployment.md`**: Unit/E2E test strategy, CI/CD pipeline, Docker/cloud deployment steps.
   - **`08-project-roadmap.md`**: Milestones, feature breakdown, tasks, timeline, change logs.

---

## 📝 PHASE 2: Content Authoring & Header Metadata

1. Edit local Markdown files in `./docs/`.
2. Update header metadata fields (`Version`, `Last Updated: YYYY-MM-DD HH:mm:ss`, `Status`).
3. **STRICT RULE**: NEVER draw diagrams using ASCII text blocks (`+---+`, `[User] -> [Server]`). Always use Draw.io MCP in Phase 3.

---

## 🎨 PHASE 3: Diagram Creation & Aesthetic Export (If Diagrams Required)

If the task requires architectural, ERD, sequence, or flow diagrams:

1. **Create Source Definition**: Generate `docs/diagrams/<name>.drawio` using Draw.io MCP server tools. Apply the **Aesthetic Design System** (`classDef` color coding per layer, rounded corners `rx=10, ry=10`).
2. **Embed Preview & Edit Link**: Insert into the Markdown file:
   ```markdown
   ![<Diagram Title>](./diagrams/<name>.png)
   [✏️ Edit Diagram in Draw.io](https://app.diagrams.net/?url=https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio)
   ```
3. **Compile Images**: Run `npm run export-diagrams` (compiles `.drawio` -> `.drawio.svg` & PNG Retina 2x).

---

## 🚀 PHASE 4: Lark Drive Synchronization

1. **Check Sync Mode**: Inspect `docs/doc-mapping.json`.
   - **Mode A: New Lark Folder Initialization** (If `doc_id` is empty or project folder is new):
     - Obtain `FOLDER_TOKEN` from user or existing context.
     - Execute: `node scripts/sync.js --init <FOLDER_TOKEN>`.
     - *If OAuth scopes requested*: Present verification URL and QR code (`docs/diagrams/lark-qr.png`) to user. Resume via `lark-cli auth login --device-code <CODE>` after user approval.
   - **Mode B: Existing Project Overwrite Update**:
     - Execute: `npm run sync` (or `node scripts/sync.js`).
2. **Verify Output**: Confirm that all documents update successfully without error.


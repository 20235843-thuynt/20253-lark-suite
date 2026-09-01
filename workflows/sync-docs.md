---
description: Workflow for updating and syncing local Markdown docs to Lark Docs via Lark CLI.
---

# Workflow: Sync Documentation to Lark Docs

Follow this workflow to update local documentation in `./docs/` and synchronize changes with Lark Docs using Lark CLI (`@larksuite/cli`).

## Step 1: Pre-flight Check
1. Verify document path inside `./docs/`.
2. Ensure file contains standard header metadata:
   ```markdown
   ---
   Title: <Document Title>
   Version: v<MAJOR>.<MINOR>.<PATCH>
   Last Updated: YYYY-MM-DD HH:mm:ss
   Lark Doc ID: <DOCUMENT_ID_OR_NONE>
   ---
   ```

## Step 2: Timestamp & Version Log
1. Increment version string (`Version: v1.0.1` -> `v1.1.0`).
2. Update timestamp using `date "+%Y-%m-%d %H:%M:%S"`.
3. Add changelog entry in the document section.

## Step 3: Synchronize via Automated Script (Recommended)

### A. Update All Existing Docs
```bash
npm run sync
# Or: node scripts/sync.js
```

### B. Initialize New Project on Lark Drive
```bash
node scripts/sync.js --init <FOLDER_TOKEN>
```
*Creates docs on Lark Drive, automatically extracts returned IDs, and saves them to `docs/doc-mapping.json` & markdown headers.*

#### 🔑 Handling OAuth Scope Approvals (If Folder Creation / Move Requires Permission):
If Lark CLI requests new OAuth scopes (`docx:document:create`, `space:document:move`, `drive:drive`):
1. Execute: `npx lark-cli auth login --scope "docx:document:create space:document:move drive:drive" --no-wait --json`
2. Generate QR code: `npx lark-cli auth qrcode --url "<VERIFICATION_URL>" --output docs/diagrams/lark-qr.png`
3. Present verification link, user code, and embedded QR code image to user.
4. After user confirms, resume: `npx lark-cli auth login --device-code <DEVICE_CODE>`
5. Run: `node scripts/sync.js --init <FOLDER_TOKEN>`

### C. Update a Single Doc
```bash
node scripts/sync.js --doc 01-prd
```


---

## Step 4: Direct CLI Commands (Alternative)

### Update Existing Doc
```bash
npx lark-cli docs +update --doc <DOCUMENT_ID> --command overwrite --doc-format markdown --content @./docs/<FILENAME>.md
```

### Create New Doc
```bash
npx lark-cli docs +create --folder-token <FOLDER_ID> --doc-format markdown --content @./docs/<FILENAME>.md
```

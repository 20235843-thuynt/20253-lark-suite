---
name: lark-docs
description: >-
  Comprehensive reference guide for interacting with Lark Docs via Lark CLI (@larksuite/cli).
  Use when performing operations on Lark Docs: creating/reading/updating documents, managing media,
  version history, permissions, comments, import/export, Drive synchronization, search, and whiteboards.
---

# Lark Docs CLI Reference Guide (@larksuite/cli)

Below is a complete 100% reference table for interacting with Lark Docs via Lark CLI (`@larksuite/cli`), categorized by feature group.

> 💡 **Fallback / Extended Help & Diagram Skills:** If the required command is not found in the reference tables below, execute the following commands or check the specialized Draw.io diagram skill:
> ```bash
> # Read in-depth guide for Document operations (Lark Docs)
> npx lark-cli skills read lark-doc
>
> # Read in-depth guide for File & Permission management (Lark Drive)
> npx lark-cli skills read lark-drive
>
> # Read in-depth guide for Spreadsheets & Databases (Lark Base / Bitable)
> npx lark-cli skills read lark-bitable
> ```
> 🎨 **Diagram Generation Skill:** See [`.agents/skills/drawio-diagrams/SKILL.md`](../drawio-diagrams/SKILL.md) for generating diagrams with Draw.io MCP and exporting SVG/PNG Retina 2x via `drawio-cli`.

---

### 🔐 OAUTH DEVICE LOGIN & SCOPE APPROVAL PROTOCOL (CRITICAL FOR AGENTS)

When performing Drive operations (creating folders, moving files, granting permissions) that require new OAuth scopes (`docx:document:create`, `space:document:move`, `drive:drive`), `lark-cli` will initiate a Device Flow authorization. The Agent MUST follow this protocol:

1. **Step 1: Extract Device Code & URL**:
   Run `npx lark-cli auth login --scope "docx:document:create space:document:move drive:drive" --no-wait --json` to get `verification_url`, `user_code`, and `device_code`.

2. **Step 2: Generate PNG QR Code Image**:
   Always generate a visual PNG QR code for the user:
   ```bash
   npx lark-cli auth qrcode --url "<VERIFICATION_URL>" --output docs/diagrams/lark-qr.png
   ```

3. **Step 3: Present Link & QR Code to User**:
   Send a clear message to the user with:
   - Clickable verification link: `[👉 Click here to authorize Lark Drive permissions](<VERIFICATION_URL>)`
   - User Code: `user_code`
   - Embedded QR Code image: `![Lark Drive Authorization QR Code](docs/diagrams/lark-qr.png)`
   - Ask user to click **Confirm (Xác nhận)** and reply **"Done" / "Xong"**.

4. **Step 4: Complete Authentication & Resume Task**:
   When the user confirms authorization, execute:
   ```bash
   npx lark-cli auth login --device-code <DEVICE_CODE>
   ```
   Then proceed immediately with creating folders/docs and running `node scripts/sync.js --init <FOLDER_TOKEN>`.

---

### ⚡ AUTOMATION SCRIPTS & DOCUMENT MAPPING (RECOMMENDED FOR AGENTS)


Agents operating in this repo MUST prioritize using the automated scripts and JSON mapping:

1. **Central Document Mapping**: [`docs/doc-mapping.json`](../../docs/doc-mapping.json)
2. **Automated Lark Sync**:
   ```bash
   # Sync all modified documents to Lark Docs (overwrite update)
   npm run sync
   # Or: node scripts/sync.js

   # Initialize new project on Lark Drive (creates docs & saves IDs automatically)
   node scripts/sync.js --init <FOLDER_TOKEN>

   # Sync a single specific document
   node scripts/sync.js --doc 01-prd
   ```
3. **Automated Diagram Export**:
   ```bash
   # Batch compile all .drawio files to SVG and PNG Retina 2x
   npm run export-diagrams
   # Or: node scripts/export-diagrams.js

   ```

---

### 📝 GROUP 1: Content Editing & Management (CRUD)

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `docs +create` | `npx lark-cli docs +create --folder-token <FOLDER_ID> --doc-format markdown --content @<PATH>` | Create a new document from Markdown or raw text content. |
| `docs +fetch` | `npx lark-cli docs +fetch --doc <DOC_ID> --doc-format markdown` | Read/Download document content locally (supports markdown, json). |
| `docs +update` | `npx lark-cli docs +update --doc <DOC_ID> --command overwrite --doc-format markdown --content @<PATH>` | Update content in an existing doc (`--command overwrite` to replace, `append` to append). |
| `drive +update-title` | `npx lark-cli drive +update-title --token <DOC_ID> --title "New Document Title"` | Rename document title directly without altering content. |
| `docs +script` | `npx lark-cli docs +script --doc <DOC_ID> --action profile` | Initialize draft workspace, check block structure (preflight & profile). |

---

### 🖼️ GROUP 2: Media & Assets Management

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `docs +media-insert` | `npx lark-cli docs +media-insert --doc <DOC_ID> --file <PATH> --type image --caption "Caption"` | Embed image/file at the end of the document (auto uploads, creates block and link). |
| `docs +media-upload` | `npx lark-cli docs +media-upload --doc <DOC_ID> --block-id <BLOCK_ID> --file <PATH>` | Upload image/attachment and attach to a specific Block ID. |
| `docs +media-download` | `npx lark-cli docs +media-download --doc <DOC_ID> --out-dir ./images` | Download all images in the document to a local folder. |
| `docs +media-preview` | `npx lark-cli docs +media-preview --doc <DOC_ID> --file-token <TOKEN>` | Preview image or file attachment resources in the document. |
| `docs +resource-update` | `npx lark-cli docs +resource-update --doc <DOC_ID> --type cover --file cover.png` | Set a Cover Image at the top of the document page. |
| `docs +resource-download` | `npx lark-cli docs +resource-download --doc <DOC_ID> --type cover --out cover.png` | Download the cover image of the document. |
| `docs +resource-delete` | `npx lark-cli docs +resource-delete --doc <DOC_ID> --type cover` | Delete the cover image of the document. |

---

### ⏳ GROUP 3: Version Control & History Revert

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `docs +history-list` | `npx lark-cli docs +history-list --doc <DOC_ID>` | View revision history list (with timestamps and editor info). |
| `docs +history-revert` | `npx lark-cli docs +history-revert --doc <DOC_ID> --version <VERSION_ID>` | Revert document to a previous historical version. |
| `docs +history-revert-status` | `npx lark-cli docs +history-revert-status --task-id <TASK_ID>` | Check status of a history revert task. |

---

### 👥 GROUP 4: Permissions & Sharing

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `drive +member-add` | `npx lark-cli drive +member-add --token <DOC_ID> --member-type email --member-id user@company.com --perm edit` | Grant access permissions (`view`: read-only, `edit`: edit, `full_access`: full control). |
| `drive +member-list` | `npx lark-cli drive +member-list --token <DOC_ID>` | List members who currently have access permissions to the document. |
| `drive +member-remove` | `npx lark-cli drive +member-remove --token <DOC_ID> --member-id <USER_OR_OPEN_ID>` | Revoke access permissions of a user or group. |
| `drive +permission-get-setting` | `npx lark-cli drive +permission-get-setting --token <DOC_ID>` | Check public sharing settings (Public Access, Link Sharing, Copy/Download lock). |
| `drive +apply-permission` | `npx lark-cli drive +apply-permission --token <DOC_ID> --perm edit --reason "Need to edit document"` | Send a View/Edit permission request to the document Owner. |

---

### 💬 GROUP 5: Comments & Review

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `drive +add-comment` | `npx lark-cli drive +add-comment --token <DOC_ID> --content "Need to add API diagram"` | Add a new comment to the document. |
| `drive +list-comments` | `npx lark-cli drive +list-comments --token <DOC_ID>` | Retrieve list of all comments and their statuses (Open / Solved). |
| `drive +add-reply` | `npx lark-cli drive +add-reply --token <DOC_ID> --comment-id <CMT_ID> --content "Added"` | Reply to an existing comment. |
| `drive +resolve-comment` | `npx lark-cli drive +resolve-comment --token <DOC_ID> --comment-id <CMT_ID>` | Mark a comment thread as resolved. |
| `drive +restore-comment` | `npx lark-cli drive +restore-comment --token <DOC_ID> --comment-id <CMT_ID>` | Reopen a resolved comment. |
| `drive +delete-reply` | `npx lark-cli drive +delete-reply --token <DOC_ID> --comment-id <CMT_ID> --reply-id <REP_ID>` | Delete a reply in a comment thread. |
| `drive +react-reply` | `npx lark-cli drive +react-reply --token <DOC_ID> --reply-id <REP_ID> --emoji "THUMBSUP"` | Add an emoji reaction to a comment reply. |

---

### 📦 GROUP 6: Import, Export & File/Folder Management (Drive)

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `drive +export` | `npx lark-cli drive +export --token <DOC_ID> --type pdf` | Export Lark Doc to PDF or Word (.docx). |
| `drive +export-download` | `npx lark-cli drive +export-download --file-token <FILE_TOKEN> --out output.pdf` | Download exported file after export task completes. |
| `drive +import` | `npx lark-cli drive +import --file spec.docx --folder-token <FOLDER_ID>` | Convert existing Word/Excel/Markdown file into a Lark Docx on Cloud. |
| `drive +copy` | `npx lark-cli drive +copy --source-token <DOC_ID> --target-folder <FOLDER_ID> --title "Copy Title"` | Clone a document to a new copy. |
| `drive +move` | `npx lark-cli drive +move --file-token <DOC_ID> --target-folder <FOLDER_ID>` | Move document to another folder on Lark Drive. |
| `drive +delete` | `npx lark-cli drive +delete --token <DOC_ID> --type docx` | Delete document (move to Trash on Lark Drive). |
| `drive +sync` | `npx lark-cli drive +sync --local-dir ./docs --folder-token <FOLDER_ID>` | Auto two-way sync between local code folder and Lark Drive folder. |

---

### 🔍 GROUP 7: Search & Whiteboard

| CLI Command | Full Syntax | Primary Purpose & Parameters |
| :--- | :--- | :--- |
| `docs +search` | `npx lark-cli docs +search --query "System Architecture"` | Full-text search across all documents in the Workspace. |
| `docs +whiteboard-update` | `npx lark-cli docs +whiteboard-update --doc <DOC_ID> --whiteboard-id <WB_ID> --dsl @chart.dsl` | Update diagram on Lark Whiteboard (supports Mermaid, PlantUML, or Whiteboard DSL). |

---

### 🔄 GROUP 8: Fallback Commands & Diagram Skill Reference

If you cannot find the specific command required, run these commands to fetch detailed documentation from Lark CLI or consult the Draw.io skill:

```bash
# Read in-depth guide for Document operations (Lark Docs)
npx lark-cli skills read lark-doc

# Read in-depth guide for File & Permission management (Lark Drive)
npx lark-cli skills read lark-drive

# Read in-depth guide for Spreadsheets & Databases (Lark Base / Bitable)
npx lark-cli skills read lark-bitable
```

- **Draw.io Diagram Skill:** [`.agents/skills/drawio-diagrams/SKILL.md`](../drawio-diagrams/SKILL.md)

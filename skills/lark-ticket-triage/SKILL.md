---
name: lark-ticket-triage
version: 1.6.1
description: "Use ONLY when the user asks to triage, phân loại ticket, gán SLA, cập nhật metadata/fields trên Base, hoặc gửi thông báo tiếp nhận cho requester. Trigger words: triage ticket, phân loại ticket, cập nhật SLA, intake ticket. Do NOT use when the user asks to analyze/investigate code or find root cause."
metadata:
  requires:
    bins: ["lark-cli"]
---

# Lark Ticket Triage Workflow

Autonomous triage and intake workflow for software engineering tickets stored in Lark Base (Bitable). Focuses on metadata calibration, SLA scheduling, executive record comments, and requester communication.

---

## 🧹 MANDATORY ZERO-LITTERING PROTOCOL (TUYỆT ĐỐI KHÔNG ĐỂ LẠI FILE RÁC)

1. **Pure In-Memory Streams First (Zero File Creation):**
   - ALWAYS stream JSON/Markdown payloads via `stdin` (`--content -`) directly in memory.
   - NEVER create unnecessary temporary files in the current workspace or project root.
2. **Deterministic Cleanup for Batch Payloads:**
   - If a temporary file is strictly required for `lark-cli` batch operations, write it exclusively to the OS temporary directory (`os.tmpdir()` or `$env:TEMP`).
   - You MUST delete all temporary files immediately inside a `finally` block or clean-up step.

---

## 🇻🇳 MANDATORY VIETNAMESE ACCENT DIRECTIVE (BẮT BUỘC TIẾNG VIỆT CÓ DẤU)

- **ALWAYS use standard Vietnamese WITH FULL ACCENTS (Tiếng Việt CÓ DẤU đầy đủ):**
  - For any Vietnamese ticket, you MUST generate natural, fluent Vietnamese text with complete diacritics (e.g., "Chào bạn, ticket của bạn đã được tiếp nhận và phân loại...").
  - **STRICTLY FORBIDDEN:** NEVER write unaccented Vietnamese (tuyệt đối KHÔNG viết không dấu).
- **Encoding Reality:** Vietnamese diacritics (`á`, `à`, `ả`, `ã`, `ạ`, `ắ`, `ế`, `ố`, `ư`, `đ`...) are standard UTF-8 and are 100% natively supported by Lark Base and Lark IM.
- **Header Label Convention:** The recommendation to use ASCII brackets (e.g. `[Triage]`, `[Overview]`, `[Risk & Impact]`, `[Next Steps]`) applies SOLELY to section title tags to replace graphical 4-byte emojis (like 📌, 🚀) in Bitable comments. All sentences, paragraphs, and descriptions within those sections MUST be written in normal, accented Vietnamese.

---

## 👥 Role-Agnostic Stakeholder Contract

Do NOT assume rigid enterprise titles (do NOT write "BA bổ sung spec", "QA chuẩn bị test case", "PO nghiệm thu"). Use universal role-agnostic terminology:
- **`Requester`**: The person who submitted the ticket. The authoritative source of this identity is the record's system **`Created By`** field (a Lark Base "Person" field), **NOT** any free-text "Requester Name"/"Reporter" field that may exist on the ticket, since a free-text field can be edited, misspelled, or filled in by someone other than the actual creator.
- **`Assignee` / `Engineering Team`**: The developer or team responsible for technical review and resolving the issue.
- **`Stakeholders`**: General team members reviewing status and tracking progress.

---

## 🔍 Context Gathering & Completeness Verification

Before calibrating metadata, this skill MUST attempt a lightweight context pass — enough to judge whether the ticket is ready to be worked on, NOT a full technical investigation (that is the job of the `ticket-to-code` skill).

### ⛔ NO-ASSUMPTION RULE (hard requirement)
You MUST NOT describe, summarize, or reference the content of any document, attachment, or repository unless you actually invoked a tool to open it in this run. Noticing that a file/link exists is not the same as reading it. If you did not call the tool, you MUST say so explicitly (e.g. "tệp đính kèm test.docx chưa được mở/đọc") — never imply it was reviewed by describing what it "likely" contains or by silently pivoting to a generic explanation of what a spec "should" clarify.

### 1. Discover every reference on the ticket
Check all three of these sources — they are distinct and none may be skipped:
a) **Description text:** Lark Doc/Wiki links (`/docx/`, `/wiki/`), repo or PR URLs, module/service names mentioned in prose.
b) **Record attachment field(s):** files uploaded directly onto the Bitable record (a Lark Base "Attachment" field type — e.g. `test.docx`). These are NOT the same as doc links in the description and are commonly missed.
c) **Repository context:** any repo/service name implied by the ticket's Labels/Affected Service, even if no explicit link was given.

### 2. Actually open what was found (read-only, no mutation)
- **Doc/Wiki links:** read via `lark-cli drive +get` (or the connected Lark MCP tool).
- **Record attachments:** download via `lark-cli base +download-attachment` (or the equivalent command exposed by your `lark-cli` version — run `lark-cli base --help` once if unsure of the exact subcommand), then extract text from the file before citing anything from it. A `.docx` attachment must be converted to text/read, not guessed at from its filename.
- **Repository/code references:**
  - If the repo is already mounted in the current workspace, do a shallow check only — confirm the mentioned file/module/service actually exists (`find_by_name`, one targeted `grep_search`).
  - If the repo is not present locally, you MUST call the connected **GitHub MCP tool** (e.g. its code/repo search function) using keywords drawn from the ticket (service name, field names, error terms). Do not skip this step just because no repo is open in the current workspace — that is precisely the case the GitHub MCP connection exists to cover.
- If a link is broken, an attachment fails to download, or GitHub MCP returns no results, record that outcome explicitly — a failed lookup is still a reportable fact, not something to omit.

### 3. Judge completeness
Classify the ticket into exactly one state:
- **`Sufficient`** — problem statement, affected service/module, and reproduction context are all present, AND every referenced doc/attachment/repo was actually opened and found consistent.
- **`Partial`** — triageable, but at least one reference exists and was not successfully opened/verified (e.g. attachment not downloaded, GitHub MCP search returned nothing relevant), or one useful reference (spec/repro steps) is simply missing.
- **`Insufficient`** — critical information is missing, or what was actually read contradicts the ticket (e.g. mentions a service/module that a real GitHub MCP search could not find in any repo).

A ticket can only be marked `Sufficient` if every discovered reference was genuinely opened — an unopened attachment or a skipped GitHub MCP lookup caps the result at `Partial` at best.

---

## 🛡️ Reliable UTF-8 Delivery Protocol

### 1. Sending Lark IM Messages
- **Recipient resolution (MANDATORY):** `requesterId` MUST be the `open_id` found inside the record's **`Created By`** field object (returned by `lark-cli base +record-get`, typically an array/object like `{ "id": "ou_xxxxxxxx", "name": "..." }`). Do NOT resolve the recipient from a free-text field or from the ticket description — `Created By` is the only field guaranteed to reflect who actually created the record.
- **Preferred Method:** `--msg-type interactive` (Lark Card) with a markdown element. Do NOT use `--msg-type text` when the content contains Markdown emphasis (`**bold**`, lists, etc.) — the text message type does not parse Markdown, so `**` characters would appear literally instead of being rendered as bold. Lark Cards support a subset of Markdown via the markdown tag: `**bold**`, `*italic*`, `~~strikethrough~~`, `[link](url)`, `<at id=all></at>`.
  ```javascript
  // requesterId MUST come from record["Created By"].id (open_id), never from a text field.
  const requesterId = record["Created By"].id;
  const cardPayload = JSON.stringify({
    config: { wide_screen_mode: true },
    header: {
      title: { tag: "plain_text", content: "Xác nhận tiếp nhận ticket" },
      template: "blue"
    },
    elements: [
      {
        tag: "markdown",
        content: "Chào bạn 👋,\n\nTicket **#00255** đã được tiếp nhận và phân loại thành công..."
      }
    ]
  });

  spawnSync('lark-cli', [
    'im', '+messages-send',
    '--user-id', requesterId,
    '--msg-type', 'interactive',
    '--content', '-',
    '--as', 'bot',
    '--format', 'json'
  ], { input: Buffer.from(cardPayload, 'utf-8'), encoding: 'utf-8', shell: true });
  ```
- ⚠️ **Never use `--file ./msg.txt`** (Lark treats it as a file attachment upload instead of a chat message).

### 2. Posting Stakeholder Comments to Base Records
- Stream JSON payload via `stdin` or write to `os.tmpdir()`:
  ```javascript
  const commentText = [
    '[Triage Overview]',
    'Ticket đã được tiếp nhận và phân tích sơ bộ.',
    '',
    '[Affected Service]',
    'Dịch vụ bị ảnh hưởng: Payment & Webhook Service.',
    '',
    '[Risk & Impact]',
    'Rủi ro mức trung bình, ảnh hưởng luồng webhook.',
    '',
    '[Related Specs]',
    'Đã kiểm tra tài liệu PRD thanh toán.',
    '',
    '[Info Completeness]',
    'Sufficient - Đầy đủ thông tin tái hiện.',
    '',
    '[Next Steps]',
    'Assignee tiến hành kiểm tra mã nguồn và triển khai bản vá.'
  ].join('\n');

  larkCli(['drive', '+add-comment', '--doc', baseToken, '--type', 'bitable', '--block-id', blockId, '--content', '-', '--as', 'bot', '--format', 'json'], JSON.stringify([{ type: 'text', text: commentText }]));
  ```

---

## 📋 Output Contracts

### 1. Requester Notification (Lark IM via Direct Message)
- **Target Audience:** Ticket Requester — resolved strictly from the record's `Created By` field, never from a free-text name field.
- **Language:** Fluent, accented Vietnamese (`Tiếng Việt có dấu chuẩn`).
- **Constraint:** Business-friendly language only. NEVER include code, regex, line numbers, function signatures, or stack traces.
- **Required Content:**
  - Lời chào lịch sự và xác nhận tiếp nhận ticket.
  - Phân loại đã chuẩn hóa (Loại ticket, Mức độ ưu tiên).
  - Trạng thái & Thời gian dự kiến xử lý (`TTR Due At` / SLA).
  - Tóm tắt hướng giải quyết ở mức độ nghiệp vụ.
  - **If completeness is Partial or Insufficient:** politely ask the requester for the specific missing detail (e.g. "bạn có thể bổ sung giúp bước tái hiện lỗi không?") in plain, friendly Vietnamese — never phrase this as a rejection of the ticket.

### 2. Stakeholder Base Comment (Lark Base Record Comment)
- **Target Audience:** Project team members viewing the ticket in Lark Base.
- **Language:** Accented Vietnamese (`Tiếng Việt có dấu`).
- **Constraint:** Executive summary only. Use ASCII section brackets (`[Triage]`, `[Overview]`) instead of 4-byte graphical emojis.
- **FIXED FORMAT — NO DEVIATION:** The comment MUST contain exactly these six sections, in this exact order, with these exact header names. Do not add extra headers (e.g. no separate `[Metadata Calibration]` or `[SLA]` blocks), do not rename any header, and do not omit any of them even if a section is short:
  1. `[Triage Overview]`: Tóm tắt vấn đề và nguyên nhân tổng quan.
  2. `[Affected Service]`: Tên dịch vụ / module bị ảnh hưởng.
  3. `[Risk & Impact]`: Đánh giá rủi ro và phạm vi ảnh hưởng.
  4. `[Related Specs]`: Đường dẫn tài liệu/PRD và tên attachment đã tìm thấy, kèm rõ ràng cái nào đã mở đọc thành công, cái nào thử mở nhưng thất bại, và cái nào chưa mở. Never state a document's content unless it was actually opened per the No-Assumption Rule above.
  5. `[Info Completeness]`: Ghi rõ trạng thái `Sufficient` / `Partial` / `Insufficient` và liệt kê cụ thể lý do (thông tin thiếu, hoặc tham chiếu chưa xác minh được) để Assignee biết cần làm gì tiếp theo. Metadata calibration results (`Type`/`Priority`/`Complexity`/`Risk`/`Team`/`Labels`) and the SLA decision belong in the Base record fields themselves (Step 4), not as separate comment sections here.
  6. `[Next Steps]`: Các bước hành động trung lập tiếp theo.

---

## 🤖 AUTONOMOUS NO-PROMPT DIRECTIVE (TỰ TRỊ TUYỆT ĐỐI - KHÔNG DỪNG HỎI)

- **NEVER prompt for confirmation, ask for scoping options, or pause for approval.**
- Execute end-to-end autonomously through Steps 1 to 6 (Calibrate fields -> Update Base -> Add Comment -> Send IM to Requester).
- When running via Cron or batch sweep ("quét ticket mới"), apply the deterministic Watermark Checkpoint mechanism below to automatically isolate valid new tickets without human guidance.

---

## 🔄 Execution Workflow

### Step 1: Ingest Ticket & Scope Determination

1. **Mode A — Specific Ticket:** If a Ticket ID (`#00258`), Record ID (`rec...`), or URL is provided: Ingest and process that specific record directly.
2. **Mode B — Latest Single Ticket:** If asked for "ticket mới nhất" or "latest ticket": Fetch the single newest record (`sort: Created At desc, limit: 1`).
3. **Mode C — Autonomous Batch Sweep (Cron / Checkpoint Watermark Mode):**
   - **Watermark Checkpoint:** Track the last processed run in `~/.agents/state/triage_watermark.json` (or `.agents/state/triage_watermark.json`):
     ```json
     {
       "last_processed_created_at": "2026-09-03T10:00:00.000+07:00",
       "last_processed_ticket_id": "#00257"
     }
     ```
   - **Ingest Scope:**
     - Query records sorted by `Created At asc` where `Created At > last_processed_created_at`.
     - If the watermark file does not exist yet (cold start): Query the newest batch created within the last 2 hours (or prompt-specified window).
     - **NO Title or Field Filtering:** Process ALL incoming tickets regardless of title (including short/test strings like `aaa`, `test`, `123` for testing) and REGARDLESS of whether Requester already filled in `Priority` or `Type` (Agent will re-evaluate, calibrate, calculate SLA, post comment, and notify).
   - **Execution & State Advance:**
     - Triage each new ticket sequentially through Steps 2–6.
     - Update the record's `Acknowledged At` field with the current timestamp on Base.
     - Advance and persist the watermark file with the `Created At` and `Ticket ID` of the latest successfully processed ticket.
   - If 0 records match the watermark window: Cleanly output: *"Không có ticket mới kể từ lần chạy trước ([last_processed_created_at])."* and exit.
4. **Authoritative Requester Resolution:** For each ticket ingested, extract the true requester identity from the **`Created By`** system field on the fetched record (a Lark Base "Person" field containing the real creator's `open_id` and display name). Store this as `requesterId` for use in Step 6 — do not substitute it with any other name field found on the ticket.

### Step 2: Gather Context & Verify Completeness
Follow the **🔍 Context Gathering & Completeness Verification** protocol above — this step is not optional and not satisfied by merely noting that a link or attachment exists:
1. Check all three sources: description text, the record's attachment field(s), and any implied repo/service context.
2. Actually call the tools: download and read every attachment found (do not guess content from a filename), open every doc link, and call the GitHub MCP tool whenever the relevant repo is not already mounted in the workspace.
3. Classify the ticket as `Sufficient`, `Partial`, or `Insufficient` per the rule that any unopened reference caps the result at `Partial`.

### Step 3: Calibrate Metadata Fields & SLA
Evaluate all ticket metadata fields, informed by the completeness result from Step 2:
- **`Type`**: Assign `Bug`, `Feature`, `Task`, or `Incident`.
- **`Priority`**: Assign `High`, `Medium`, or `Low`.
- **`Complexity`**: Assign `High`, `Medium`, or `Low`.
- **`Risk`**: Assign `High`, `Medium`, or `Low`.
- **`Team`**: Assign `Engineer`.
- **`Labels`**: Assign relevant domain tags (e.g. `["Payment", "Backend"]`, `["Frontend", "UI/UX"]`). If completeness is `Partial` or `Insufficient`, also add a `"Needs-Info"` label so it is filterable in Base views.
- **`TTR Due At`**: Evaluate current deadline. If unrealistic or overly tight (< 2 hours for non-trivial bugs), automatically reschedule based on `config.json` SLA matrix. If completeness is `Insufficient`, do not shorten the SLA further than the matrix default — waiting on requester input is expected.

### Step 4: Update Lark Base Record
Apply field updates to the record via `lark-cli base +record-batch-update` using a temp file in `os.tmpdir()` cleaned up immediately in `finally`. Ensure `Acknowledged At` is stamped with the current ISO datetime.

### Step 5: Post Stakeholder Comment
Post the Executive Stakeholder Comment to the record using `lark-cli drive +add-comment`, following the FIXED FORMAT (exactly six sections, in order) defined in the Output Contract above, via `stdin`.

### Step 6: Notify Requester
Send the formatted, accented Vietnamese notification to `requesterId` (the `open_id` resolved from the record's `Created By` field in Step 1) as an interactive Lark Card using `lark-cli im +messages-send` via `stdin`. Include the completeness-based follow-up question when applicable, per the Output Contract above. Finally, update and persist the watermark checkpoint in `~/.agents/state/triage_watermark.json`.
